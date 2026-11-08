-- Adds logos and website links to Experience and Education, and a picture for the Lusitania project.
-- Paste into Supabase > SQL Editor > New query > Run. Safe to run more than once.
alter table experience add column if not exists logo_url text;
alter table experience add column if not exists link text;
alter table education  add column if not exists logo_url text;
alter table education  add column if not exists link text;

update experience set logo_url = 'images/logos/lusitania.png', link = 'https://lusitaniainvestments.fr/' where org = 'Lusitania Investments' and logo_url is null;
update experience set logo_url = 'images/logos/weenat.png',    link = 'https://weenat.com/'               where org = 'Weenat'                and logo_url is null;
update experience set logo_url = 'images/logos/fitnessup.png', link = 'https://fitnessup.pt/'             where org = 'Fitness Up'            and logo_url is null;

update education set logo_url = 'images/logos/nhlstenden.png', link = 'https://www.nhlstenden.com/'      where title in ('BBA International Business', 'X-Honours Programme, NHL Stenden') and logo_url is null;
update education set logo_url = 'images/logos/google.png',     link = 'https://skillshop.withgoogle.com/' where title = 'The Fundamentals of Digital Marketing' and logo_url is null;
update education set logo_url = 'images/logos/analytics.png',  link = 'https://skillshop.withgoogle.com/' where title = 'Google Analytics' and logo_url is null;
update education set logo_url = 'images/logos/ielts.png',      link = 'https://ielts.org/'                where title = 'English C2 — IELTS Academic' and logo_url is null;

update projects set image_url = 'images/projects/lusitania.jpg' where title = 'Lusitania Investments' and (image_url is null or image_url = '');
