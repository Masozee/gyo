import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://vvzhwzzotfqbfvivjgyv.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2emh3enpvdGZxYmZ2aXZqZ3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDI1NDgsImV4cCI6MjA2NjQxODU0OH0.YdPn4BYp5Rt5ETeP7MeWWySPDuPPgMWNFLN4X8qJ8So';

// Supabase client for auth and realtime
export const supabase = createClient(supabaseUrl, supabaseKey); 