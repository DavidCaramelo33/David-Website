-- Adds the Portfolio gallery (pictures of your work). Safe to run more than once.
-- Paste into Supabase > SQL Editor > New query > Run.
create table if not exists portfolio (
  id uuid primary key default gen_random_uuid(),
  title text not null, category text, image_url text, description text, link text,
  sort int default 0, visible boolean default true
);
alter table portfolio enable row level security;
drop policy if exists "public read" on portfolio;
drop policy if exists "admin write" on portfolio;
create policy "public read" on portfolio for select using (visible or is_admin());
create policy "admin write" on portfolio for all using (is_admin()) with check (is_admin());

insert into portfolio (title, category, image_url, link, sort)
select 'Lusitania Investments website', 'Website', 'images/projects/lusitania.jpg', 'https://lusitaniainvestments.fr/', 1
where not exists (select 1 from portfolio);
