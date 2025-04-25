
import pandas as pd
from supabase import create_client, Client
import os
from collections import Counter

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Fetch all lineups
lineups_response = supabase.table("lineups").select("*").execute()
df = pd.DataFrame(lineups_response.data)
df["created_at"] = pd.to_datetime(df["created_at"], errors="coerce")

# Create lineup_key to identify duplicates
df["lineup_key"] = (
    df["headliner"].fillna("") + "||" +
    df["second_opener"].fillna("") + "||" +
    df["opener"].fillna("")
).str.lower().str.strip()

# Count identical lineups per prompt
lineup_counts = df.groupby(["prompt", "lineup_key"]).size().reset_index(name="lineup_occurrences")
df = df.merge(lineup_counts, on=["prompt", "lineup_key"], how="left")
df["lineup_score"] = df["votes"] + df["lineup_occurrences"]

# Wins: lineups with highest score per prompt
winning_lineups = df.loc[df.groupby("prompt")["lineup_score"].transform("max") == df["lineup_score"]]
wins_df = winning_lineups.groupby("user_id").size().reset_index(name="wins")

# Promoted lineups
promoted_df = df.groupby("user_id").size().reset_index(name="promoted_lineups")

# Total votes received
votes_df = df.groupby("user_id")["votes"].sum().reset_index(name="votes_received")

# Top 10s by lineup_score
top_10_user_ids = []
for prompt in df["prompt"].dropna().unique():
    top_10 = df[df["prompt"] == prompt].sort_values(by="lineup_score", ascending=False).head(10)
    top_10_user_ids.extend(top_10["user_id"].tolist())
top_10_df = pd.DataFrame(Counter(top_10_user_ids).items(), columns=["user_id", "top_10s"])

# Longest streak
streaks = []
for uid, group in df.groupby("user_id"):
    dates = group["created_at"].dt.date.dropna().drop_duplicates().sort_values()
    longest = 0
    current = 0
    prev = None
    for d in dates:
        if prev is None or (d - prev).days == 1:
            current += 1
        else:
            longest = max(longest, current)
            current = 1
        prev = d
    longest = max(longest, current)
    streaks.append({"user_id": uid, "longest_streak": longest})
streak_df = pd.DataFrame(streaks)

# Merge all
user_stats = promoted_df     .merge(top_10_df, on="user_id", how="left")     .merge(votes_df, on="user_id", how="left")     .merge(wins_df, on="user_id", how="left")     .merge(streak_df, on="user_id", how="left")

# Fill and calculate score and rank
user_stats = user_stats.fillna(0).astype({
    "promoted_lineups": "int",
    "top_10s": "int",
    "votes_received": "int",
    "wins": "int",
    "longest_streak": "int"
})
user_stats["score"] = user_stats["wins"] * 10 + user_stats["votes_received"]
user_stats = user_stats.sort_values(by="score", ascending=False).reset_index(drop=True)
user_stats["global_rank"] = user_stats.index + 1

# Push to Supabase
records = user_stats.to_dict(orient="records")
for record in records:
    supabase.table("user_stats").upsert(record, on_conflict=["user_id"]).execute()
