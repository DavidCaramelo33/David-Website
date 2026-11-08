-- =====================================================================
-- David Caramelo portfolio — database setup
-- Paste this whole file into Supabase > SQL Editor > New query > Run.
-- Safe to run once on a NEW, EMPTY Supabase project.
-- =====================================================================

-- ---------- Who is allowed to edit (the admin) ----------
create table admins (email text primary key);
-- >>> CHANGE THIS to the email you will log in with <<<
insert into admins (email) values ('david.trindade.caramelo20@gmail.com');

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where email = auth.jwt() ->> 'email');
$$;

-- ---------- Site content ----------
create table profile (
  id int primary key default 1 check (id = 1),   -- only ever one row
  data jsonb not null,
  updated_at timestamptz default now()
);

create table experience (
  id uuid primary key default gen_random_uuid(),
  title text not null, org text, place text, period text, description text,
  sort int default 0, visible boolean default true
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null, tag text, description text, link text, image_url text,
  featured boolean default false, sort int default 0, visible boolean default true
);

create table education (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'education' check (kind in ('education','certification')),
  title text not null, period text, description text,
  sort int default 0, visible boolean default true
);

create table posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null, excerpt text, body text, cover_url text, tag text,
  published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- Inbox & visitors ----------
create table messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) <= 200),
  email text not null check (char_length(email) <= 200),
  message text not null check (char_length(message) <= 5000),
  kind text not null default 'general' check (kind in ('job','freelance','general')),
  is_read boolean default false,
  created_at timestamptz default now()
);

create table page_views (
  id bigint generated always as identity primary key,
  path text check (char_length(path) <= 300),
  referrer text check (char_length(referrer) <= 500),
  visitor text check (char_length(visitor) <= 64),
  created_at timestamptz default now()
);

-- ---------- Security rules ----------
alter table admins     enable row level security;
alter table profile    enable row level security;
alter table experience enable row level security;
alter table projects   enable row level security;
alter table education  enable row level security;
alter table posts      enable row level security;
alter table messages   enable row level security;
alter table page_views enable row level security;

-- Everyone can read the public content; only the admin can change it
create policy "public read" on profile    for select using (true);
create policy "public read" on experience for select using (visible or is_admin());
create policy "public read" on projects   for select using (visible or is_admin());
create policy "public read" on education  for select using (visible or is_admin());
create policy "public read" on posts      for select using (published or is_admin());

create policy "admin write" on profile    for all using (is_admin()) with check (is_admin());
create policy "admin write" on experience for all using (is_admin()) with check (is_admin());
create policy "admin write" on projects   for all using (is_admin()) with check (is_admin());
create policy "admin write" on education  for all using (is_admin()) with check (is_admin());
create policy "admin write" on posts      for all using (is_admin()) with check (is_admin());

-- Visitors can send messages and be counted, but only the admin can read them
create policy "anyone can send" on messages   for insert with check (true);
create policy "admin reads"     on messages   for select using (is_admin());
create policy "admin updates"   on messages   for update using (is_admin());
create policy "admin deletes"   on messages   for delete using (is_admin());
create policy "anyone counted"  on page_views for insert with check (true);
create policy "admin reads"     on page_views for select using (is_admin());
create policy "admin reads"     on admins     for select using (is_admin());

-- ---------- Photo storage ----------
insert into storage.buckets (id, name, public) values ('media', 'media', true);
create policy "public media read"  on storage.objects for select using (bucket_id = 'media');
create policy "admin media insert" on storage.objects for insert with check (bucket_id = 'media' and is_admin());
create policy "admin media update" on storage.objects for update using (bucket_id = 'media' and is_admin());
create policy "admin media delete" on storage.objects for delete using (bucket_id = 'media' and is_admin());

-- ---------- Starting content (from your CV) ----------
insert into profile (data) values ('{
  "name": "David Caramelo",
  "headline": "Real Estate Marketing",
  "pitch": "I build the strategy that takes a property from listing to sale: positioning, content, SEO and campaigns that reach the right buyer.",
  "status": "Open to work · Angers, France · Remote or relocation within France",
  "about_title": "Where marketing meets real estate",
  "about": "I''m a marketer who loves the craft of selling property: understanding a home, finding its story, and building the full strategy to put it in front of the right people.\n\nI''ve spent more than six years in customer relations and digital marketing, and founded Lusitania Investments, a real estate company that connects international investors with opportunities in Portugal. That''s where I work on the whole process, from market research and brand to SEO, email campaigns and listings.\n\nI''m studying International Business at NHL Stenden University with a specialisation in marketing. I work in Portuguese, English, Spanish and French, and I''m looking for my next role in real estate marketing or real estate development.",
  "facts": [["6+","Years in marketing & client relations"],["4","Working languages"],["2024","Founded Lusitania Investments"]],
  "expertise": ["Real estate & property marketing","Marketing strategy & campaigns","SEO","Email marketing","Content & multimedia creation","Data & market analysis","Project coordination"],
  "tools": ["Adobe InDesign & Adobe tools","Brevo · Mailchimp","Google Ads · Meta Ads","Google Analytics","Canva · Figma","CapCut · DaVinci Resolve","Microsoft Office"],
  "languages": [["Portuguese","Native"],["English","C2"],["Spanish","C2"],["French","B1"]],
  "photo_url": "",
  "linkedin": "",
  "website": "https://lusitaniainvestments.fr/",
  "contact_title": "Let''s market something remarkable",
  "contact_text": "I''m open to roles in real estate marketing and development, remote or anywhere in France."
}');

insert into experience (title, org, place, period, description, sort) values
('Founder','Lusitania Investments','Angers, France','2024 — Present','Founded and built a real estate investment company connecting international investors with property opportunities in Portugal. I lead business development and the full marketing strategy: brand, website content, SEO, email marketing and social media.',1),
('Marketing Intern','Weenat','Nantes, France','2025 — 2026','Contributed to digital marketing campaigns through content creation, social media management and market analysis, helping increase brand visibility and engagement.',2),
('Freelance Marketing Manager','','Remote','2019 — Present','Creating targeted social media content for clients to increase visibility and engage potential customers.',3),
('Sales Assistant','Fitness Up','Oeiras, Portugal','2021 — 2022','Delivered high-quality customer service with personalised advice and tailored membership plans, and promoted the gym''s services.',4);

insert into projects (title, tag, description, link, featured, sort) values
('Lusitania Investments','Real Estate · Founder','A real estate company helping international (especially French) investors buy property in Portugal. I built its marketing from the ground up: positioning, SEO and content strategy, email campaigns, property listings and social media.','https://lusitaniainvestments.fr/',true,1),
('Geldloket Communication Strategy','Strategy · 2022–2023','A marketing and communication strategy for a financial consulting firm for young adults, with social media content, influencer collaborations, workshops and partnerships.',null,false,2),
('City of Emmen Promo Film','Video · 2022','A promotional video for the city of Emmen, taken from brainstorming and storyboard through filming landmarks and interviews with locals.',null,false,3),
('Helios Student Association','Campus · Marketing Manager','Designed and ran targeted communication strategies to raise awareness for the association at NHL Stenden University.',null,false,4);

insert into education (kind, title, period, description, sort) values
('education','BBA International Business','2023 — Present','NHL Stenden University of Applied Sciences, Emmen (NL). Specialisation in Marketing & Sales, plus Finance, Operations & Supply Chain, and Organisational Behaviour.',1),
('education','Business Diploma','2017 — 2020','São João do Estoril Vocational High School, Portugal. Specialisation in Marketing, Advertising & Public Relations.',2),
('certification','The Fundamentals of Digital Marketing','2023',null,1),
('certification','Google Analytics','2022',null,2),
('certification','English C2 — IELTS Academic','2020',null,3),
('certification','X-Honours Programme, NHL Stenden','2022','Leadership development and cross-cultural business.',4);
