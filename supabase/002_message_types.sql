-- Adds a "type" to contact messages: job offer, freelance project, or general.
-- Paste into Supabase > SQL Editor > New query > Run. Safe to run more than once.
alter table messages add column if not exists kind text not null default 'general';
alter table messages drop constraint if exists messages_kind_check;
alter table messages add constraint messages_kind_check check (kind in ('job','freelance','general'));
