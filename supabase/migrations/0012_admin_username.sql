-- Optional username for admins so new admin accounts can be created and
-- logged into without needing a real email address. Existing admins keep
-- logging in with their email; username is null for them.
alter table public.admins add column username text unique;
