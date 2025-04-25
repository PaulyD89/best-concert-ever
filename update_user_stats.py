import pandas as pd
from supabase import create_client, Client
from datetime import datetime
from collections import defaultdict
import os

# Supabase credentials (set these securely as environment variables)
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Fetch lineups
lineups_response = supabase.table("lineups").select("*").execute()
lineups = lineups_response.data
df = pd.DataFrame(lineups)
df["created_at"] = pd.to_datetime(df["created_at"], errors="coerce")

# Promoted Lineups
promoted = df.groupby("user_id").size().reset_index(name="promoted_lineups")

# Top 10s
top_10s = defaultdict(int)
for prompt in df["prompt"].dropna().unique():
    top_10 = df[df["prompt"] == prompt].sort_values(by="votes", ascending=False).head(10)
    for uid in top_10["user_id"]:
        top_10s[uid] += 1
top_10s_df = pd.DataFrame(list(top_10s.items()), columns=["user_id", "top_10s"])

# Total Votes Received
votes = df.groupby("user_id")["votes"].sum().reset_index(name="votes_received")

# Wins
max_votes = df.groupby("prompt")["votes"].transform("max")
df["is_winner"] = df["votes"] == max_votes
wins = df[df["is_winner"]].groupby("user_id").size().reset_index(name="wins")

# Longest Streak
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
streaks_df = pd.DataFrame(streaks)

# Merge All
merged = promoted.merge(top_10s_df, on="user_id", how="left") \
                 .merge(votes, on="user_id", how="left") \
                 .merge(wins, on="user_id", how="left") \
                 .merge(streaks_df, on="user_id", how="left")

merged = merged.fillna(0).astype({
    "promoted_lineups": "int",
    "top_10s": "int",
    "votes_received": "int",
    "wins": "int",
    "longest_streak": "int"
})

merged["score"] = merged["wins"] * 10 + merged["votes_received"]
merged = merged.sort_values(by="score", ascending=False).reset_index(drop=True)
merged["global_rank"] = merged.index + 1

# Upsert into user_stats
records = merged.to_dict(orient="records")
for record in records:
    supabase.table("user_stats").upsert(record, on_conflict=["user_id"]).execute()
