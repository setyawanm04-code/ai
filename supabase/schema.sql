-- ═══════════════════════════════════════════════════════════════
-- DEVFORGE AI — Database Schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- Every user-owned table has Row Level Security enabled.
-- ═══════════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  headline text,
  bio text,
  skills text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles are viewable by owner" on profiles
  for select using (auth.uid() = id);
create policy "profiles are publicly viewable for portfolio" on profiles
  for select using (true);
create policy "profiles are editable by owner" on profiles
  for update using (auth.uid() = id);
create policy "profiles are insertable by owner" on profiles
  for insert with check (auth.uid() = id);

-- Auto-create a profile row on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─────────────────────────────────────────────
-- PROJECTS + MEMBERSHIP (owner / member / viewer)
-- ─────────────────────────────────────────────
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active','archived','completed')),
  template text default 'blank',
  tech_stack jsonb default '{}',
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists project_members (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('owner','member','viewer')),
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);

alter table projects enable row level security;
alter table project_members enable row level security;

create or replace function is_project_member(p_project_id uuid)
returns boolean as $$
  select exists (
    select 1 from project_members
    where project_id = p_project_id and user_id = auth.uid()
  ) or exists (
    select 1 from projects where id = p_project_id and owner_id = auth.uid()
  );
$$ language sql security definer stable;

create policy "members can read their projects" on projects
  for select using (owner_id = auth.uid() or is_project_member(id) or is_public);
create policy "owners manage projects" on projects
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "members visible to project participants" on project_members
  for select using (is_project_member(project_id));
create policy "owners manage membership" on project_members
  for all using (exists (select 1 from projects where id = project_id and owner_id = auth.uid()));

-- ─────────────────────────────────────────────
-- PROJECT FILES / VERSIONS / SETTINGS (virtual FS)
-- ─────────────────────────────────────────────
create table if not exists project_files (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  path text not null,
  content text default '',
  language text default 'plaintext',
  size int default 0,
  hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, path)
);

create table if not exists project_versions (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  label text not null,
  snapshot jsonb not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists project_settings (
  project_id uuid primary key references projects(id) on delete cascade,
  rules_md text default '',
  visibility text default 'private',
  updated_at timestamptz not null default now()
);

alter table project_files enable row level security;
alter table project_versions enable row level security;
alter table project_settings enable row level security;

create policy "members access files" on project_files for all
  using (is_project_member(project_id)) with check (is_project_member(project_id));
create policy "members access versions" on project_versions for all
  using (is_project_member(project_id)) with check (is_project_member(project_id));
create policy "members access settings" on project_settings for all
  using (is_project_member(project_id)) with check (is_project_member(project_id));

-- ─────────────────────────────────────────────
-- AI: conversations, messages, requests, memory, index, dependencies
-- ─────────────────────────────────────────────
create table if not exists conversations (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text default 'New conversation',
  mode text default 'BUILD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant','system','tool')),
  content text not null,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

create table if not exists ai_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  mode text,
  provider text default 'gemini',
  input_chars int,
  output_tokens int,
  status text default 'completed' check (status in ('completed','failed','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists project_memory (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  key text not null,
  value text not null,
  important boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists project_index (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  file_path text not null,
  symbols jsonb default '[]',
  imports jsonb default '[]',
  exports jsonb default '[]',
  updated_at timestamptz not null default now(),
  unique (project_id, file_path)
);

create table if not exists project_dependencies (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  package_name text not null,
  version text,
  dep_type text default 'dependency' check (dep_type in ('dependency','devDependency')),
  status text default 'ok',
  updated_at timestamptz not null default now()
);

alter table conversations enable row level security;
alter table messages enable row level security;
alter table ai_requests enable row level security;
alter table project_memory enable row level security;
alter table project_index enable row level security;
alter table project_dependencies enable row level security;

create policy "user owns conversations" on conversations for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "user reads own messages" on messages for all
  using (exists (select 1 from conversations c where c.id = conversation_id and c.user_id = auth.uid()));
create policy "user owns ai_requests" on ai_requests for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "members access memory" on project_memory for all
  using (is_project_member(project_id)) with check (is_project_member(project_id));
create policy "members access index" on project_index for all
  using (is_project_member(project_id)) with check (is_project_member(project_id));
create policy "members access dependencies" on project_dependencies for all
  using (is_project_member(project_id)) with check (is_project_member(project_id));

-- ─────────────────────────────────────────────
-- TASKS / BUGS / ISSUES / NOTIFICATIONS
-- ─────────────────────────────────────────────
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'backlog' check (status in ('backlog','todo','in_progress','review','done')),
  priority text default 'medium' check (priority in ('low','medium','high','urgent')),
  labels text[] default '{}',
  assignee_id uuid references auth.users(id),
  due_date date,
  related_bug_id uuid,
  ai_generated boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bugs (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open','in_progress','fixed','verified','closed')),
  severity text default 'medium' check (severity in ('critical','high','medium','low')),
  priority text default 'medium' check (priority in ('low','medium','high','urgent')),
  reproduction_steps text,
  expected_behavior text,
  actual_behavior text,
  ai_analysis text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table tasks add constraint tasks_related_bug_fk foreign key (related_bug_id) references bugs(id) on delete set null;

create table if not exists issues (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  type text not null check (type in ('feature','bug','improvement','question','documentation')),
  title text not null,
  description text,
  status text default 'open',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table tasks enable row level security;
alter table bugs enable row level security;
alter table issues enable row level security;
alter table notifications enable row level security;

create policy "members access tasks" on tasks for all
  using (is_project_member(project_id)) with check (is_project_member(project_id));
create policy "members access bugs" on bugs for all
  using (is_project_member(project_id)) with check (is_project_member(project_id));
create policy "members access issues" on issues for all
  using (is_project_member(project_id)) with check (is_project_member(project_id));
create policy "user owns notifications" on notifications for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- PORTFOLIO + GITHUB CONNECTIONS
-- ─────────────────────────────────────────────
create table if not exists portfolio_projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  title text not null,
  description text,
  technologies text[] default '{}',
  screenshot_url text,
  github_url text,
  live_url text,
  featured boolean default false,
  is_public boolean default true,
  created_at timestamptz not null default now()
);

create table if not exists github_connections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  github_username text,
  access_token_encrypted text, -- never store raw tokens; encrypt at rest server-side
  connected_at timestamptz not null default now()
);

alter table portfolio_projects enable row level security;
alter table github_connections enable row level security;

create policy "public portfolio is readable" on portfolio_projects
  for select using (is_public = true or user_id = auth.uid());
create policy "user manages own portfolio" on portfolio_projects
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "user manages own github connection" on github_connections
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- AUDIT LOG (never store secrets in this table)
-- ─────────────────────────────────────────────
create table if not exists audit_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  action text not null,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

alter table audit_log enable row level security;
create policy "user reads own audit trail" on audit_log
  for select using (user_id = auth.uid());
create policy "user inserts own audit rows" on audit_log
  for insert with check (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────
create index if not exists idx_projects_owner on projects(owner_id);
create index if not exists idx_files_project on project_files(project_id);
create index if not exists idx_tasks_project_status on tasks(project_id, status);
create index if not exists idx_bugs_project_status on bugs(project_id, status);
create index if not exists idx_messages_conversation on messages(conversation_id);
create index if not exists idx_notifications_user_unread on notifications(user_id, read);
create index if not exists idx_memory_project on project_memory(project_id);

-- ─────────────────────────────────────────────
-- updated_at maintenance trigger
-- ─────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare t text;
begin
  foreach t in array array['projects','project_files','project_settings','conversations',
    'project_memory','project_index','project_dependencies','tasks','bugs','issues','profiles']
  loop
    execute format('drop trigger if exists trg_updated_at on %I;', t);
    execute format('create trigger trg_updated_at before update on %I for each row execute procedure set_updated_at();', t);
  end loop;
end $$;
