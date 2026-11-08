-- Adds the "Beyond work" personal section (your interests and hobbies). Safe to run more than once.
-- Paste into Supabase > SQL Editor > New query > Run. Check the project is luaxqiybqezjvfhzwykv first.
create table if not exists interests (
  id uuid primary key default gen_random_uuid(),
  title text not null, description text, image_url text,
  sort int default 0, visible boolean default true
);
alter table interests enable row level security;
drop policy if exists "public read" on interests;
drop policy if exists "admin write" on interests;
create policy "public read" on interests for select using (visible or is_admin());
create policy "admin write" on interests for all using (is_admin()) with check (is_admin());

-- Make the website see the new table straight away
notify pgrst, 'reload schema';
