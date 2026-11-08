-- Lets a blog post show a PDF as an animated flipbook. Safe to run more than once.
-- Paste into Supabase > SQL Editor > New query > Run. Check the project is luaxqiybqezjvfhzwykv first.
alter table posts add column if not exists pdf_url text;

-- Make the website see the new column straight away
notify pgrst, 'reload schema';
