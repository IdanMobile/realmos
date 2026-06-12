# Realm Scoping Contract

RealmOS separates global system scope from project/business realm scope.

```ts
type ScopeLevel = "global" | "realm";
```

Operational entities must include scope and/or realmId.

Global RealmOS objects and project Realm objects must not be mixed.
