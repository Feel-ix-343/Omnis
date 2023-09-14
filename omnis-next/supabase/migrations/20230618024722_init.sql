create table if not exists todos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text,
  is_complete boolean default false,
  user_id uuid references auth.users default auth.uid()
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table todos
  enable row level security;

CREATE POLICY "Enable all for users based on user_id" ON "public"."todos"
AS PERMISSIVE FOR ALL
TO public
USING (auth.uid() = user_id)
