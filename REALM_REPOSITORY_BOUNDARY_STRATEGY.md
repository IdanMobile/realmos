# Realm Repository Boundary Strategy v1

## Decision

Every Realm / Project can have its own repository boundary.

RealmOS global code and project-local code must not be mixed accidentally.

## Why

Repository boundaries prevent agents from:

- editing the wrong repo
- creating conflicts between unrelated projects
- mixing global RealmOS work with GUING work
- running tests in the wrong package
- opening PRs against the wrong target
- creating artifacts in the wrong place

## Repository Binding

Each Realm can bind to zero, one, or multiple repositories.

```ts
type RepositoryBinding = {
  id: string;
  realmId: string;
  provider: "github" | "gitlab" | "local" | "other";
  repoName: string;
  repoUrl?: string;
  localPath?: string;
  defaultBranch: string;
  allowedBranches: string[];
  worktreeRoot?: string;
  packagePaths: string[];
  protectedPaths: string[];
  ownershipRules: RepositoryOwnershipRule[];
  createdAt: string;
  updatedAt: string;
};
```

## Cursor Work Packet Repository Context

Every Cursor Work Packet must include repository context.

```ts
type CursorRepositoryContext = {
  repositoryBindingId: string;
  repoName: string;
  localPath?: string;
  branchName: string;
  worktreePath?: string;
  allowedPaths: string[];
  forbiddenPaths: string[];
  verificationCommands: string[];
};
```

## Rule

No Cursor Work Packet is valid unless it says:

- which realm it belongs to
- which repo it targets
- which branch/worktree to use
- which files are allowed
- which files are forbidden
- which verification commands to run

## Conflict Prevention

Fleet Controller must check:

- same repository
- same branch
- same worktree
- overlapping file paths
- same package
- same migration folder
- same generated artifact path
- same config file
- protected global paths
- cross-realm boundary edits

## Multi-Repo Realm

Some realms can have multiple repositories.

Example GUING:

```text
Realm: GUING
  repo: guing-product
  repo: guing-brain-lab
  repo: guing-runtime-server
```

## Approval Gates

Require approval when work:

- touches protected paths
- changes global config
- changes repository binding
- modifies CI/CD
- modifies secrets/env files
- targets production branch
- crosses realm boundary
- uses destructive Git operations
- opens PR externally

## UI Requirements

Project Repository page should show:

- connected repos
- branches/worktrees
- active work packets by repo
- path ownership rules
- protected paths
- conflicts
- verification commands
- recent commits/reports
- open PRs later

## Infrastructure Boundary

Repository boundaries do not mean infrastructure sharing.

A project repository can be managed by RealmOS, but the project runtime infrastructure must remain dedicated to the project.

RealmOS may track the repository, work packets, execution reports, and decisions.

RealmOS must not silently become the project's production database, backend, auth, storage, or runtime.
