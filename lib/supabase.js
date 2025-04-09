import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,     // Your Supabase URL from environment variable
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Your Supabase anon key from environment variable
);

// Test the connection to Supabase (fetching all rows from the 'lineups' table)
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('lineups').select('*'); // Fetch all lineups
    if (error) throw error; // If there’s an error, throw it
    console.log("Data fetched from Supabase:", data); // Log the data from the lineups table
  } catch (error) {
    console.error("Error connecting to Supabase:", error); // Log any errors
  }
};

// Call the test function to verify the connection
testConnection();
