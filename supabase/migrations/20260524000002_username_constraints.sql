-- ============================================================
-- Username format + reserved-name constraints on profiles
-- Apply via: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Regex: lowercase letters, digits, underscores; 3–20 chars.
alter table public.profiles
  add constraint username_format
  check (username ~ '^[a-z0-9_]{3,20}$');

-- Reserved names that must never be claimed by a user.
alter table public.profiles
  add constraint username_not_reserved
  check (username not in (
    'admin', 'administrator',
    'support', 'help',
    'koe', 'koemoe',
    'api', 'auth', 'rpc',
    'root', 'system', 'daemon',
    'mod', 'moderator', 'staff',
    'info', 'contact', 'security',
    'about', 'privacy', 'terms',
    'null', 'undefined', 'anonymous',
    'me', 'you', 'us', 'them', 'user'
  ));
