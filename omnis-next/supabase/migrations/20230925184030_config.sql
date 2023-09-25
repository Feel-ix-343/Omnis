create table config (
    user_id uuid references auth.users default auth.uid(),
    tool_is_expanded boolean default true not null
);

-- inserts a row into public.profiles
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.config (user_id, tool_is_expanded)
  values (new.id, true);
  return new;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table config enable row level security;

CREATE POLICY "Enable all for users based on user_id" ON config
    AS PERMISSIVE FOR ALL
    TO public
    USING (auth.uid() = user_id);





