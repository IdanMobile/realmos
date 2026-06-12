# RealmOS — Database Schema Draft v1

This is a starting Postgres schema draft.

## Tables

### businesses

```sql
create table businesses (
  id text primary key,
  name text not null,
  mission text not null,
  type text not null,
  status text not null,
  owner_user_id text not null,
  ceo_agent_id text,
  memory_scope_id text not null,
  budget_id text,
  metrics jsonb not null default '[]',
  risks jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### agents

```sql
create table agents (
  id text primary key,
  name text not null,
  role text not null,
  scope text not null,
  business_id text references businesses(id),
  directive text not null,
  agenda text,
  skills jsonb not null default '[]',
  limitations jsonb not null default '[]',
  tools jsonb not null default '[]',
  memory_access jsonb not null default '[]',
  model_profile jsonb not null,
  budget_id text,
  reports_to text,
  can_create_agents boolean not null default false,
  can_execute_code boolean not null default false,
  can_spend_money boolean not null default false,
  can_contact_humans boolean not null default false,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### tasks

```sql
create table tasks (
  id text primary key,
  business_id text references businesses(id),
  title text not null,
  goal text not null,
  assigned_agent_id text references agents(id),
  status text not null,
  priority text not null,
  requires_approval boolean not null default false,
  dependencies jsonb not null default '[]',
  artifacts jsonb not null default '[]',
  audit_event_ids jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### memories

```sql
create table memories (
  id text primary key,
  scope text not null,
  scope_id text not null,
  kind text not null,
  title text not null,
  content text not null,
  source text not null,
  sensitivity text not null,
  retention text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### approval_requests

```sql
create table approval_requests (
  id text primary key,
  requested_by_agent_id text references agents(id),
  business_id text references businesses(id),
  action_type text not null,
  risk_level text not null,
  title text not null,
  description text not null,
  payload jsonb not null default '{}',
  status text not null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
```

### audit_events

```sql
create table audit_events (
  id text primary key,
  actor_type text not null,
  actor_id text,
  business_id text,
  task_id text,
  event_type text not null,
  summary text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);
```

### budgets

```sql
create table budgets (
  id text primary key,
  scope text not null,
  scope_id text not null,
  monthly_limit numeric,
  hard_limit numeric,
  currency text not null default 'USD',
  requires_approval_above numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### cost_entries

```sql
create table cost_entries (
  id text primary key,
  business_id text,
  agent_id text,
  run_id text,
  provider text not null,
  model text,
  tool text,
  amount numeric not null,
  currency text not null default 'USD',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
```

### artifacts

```sql
create table artifacts (
  id text primary key,
  business_id text references businesses(id),
  task_id text references tasks(id),
  kind text not null,
  title text not null,
  path text,
  content text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
```

### world_maps

```sql
create table world_maps (
  id text primary key,
  title text not null,
  version text not null,
  nodes jsonb not null default '[]',
  edges jsonb not null default '[]',
  updated_at timestamptz not null default now()
);
```

## Indexes

```sql
create index idx_agents_business_id on agents(business_id);
create index idx_tasks_business_id on tasks(business_id);
create index idx_tasks_assigned_agent_id on tasks(assigned_agent_id);
create index idx_memories_scope on memories(scope, scope_id);
create index idx_approval_status on approval_requests(status);
create index idx_audit_business_id on audit_events(business_id);
create index idx_cost_business_id on cost_entries(business_id);
```

## Note

This schema is intentionally simple for MVP. Later we may add:

- users table
- auth
- vector embeddings
- run traces
- tool call tables
- thread/messages tables
- multi-tenant support
