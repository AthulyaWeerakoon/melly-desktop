# Native JavaScript API (draft)

Melly will expose host-neutral native operations on `globalThis.melly`. The runtime authorizes a call before routing it to a compositor adapter or Linux service. The API is intentionally semantic: desktop code never sends Sway commands or raw Wayland messages.

The browser preview implements only the subset used by the sample and does not provide real native authority.

## Capabilities

```js
if (melly.capabilities.has("workspaces.control")) {
  // Show workspace controls.
}
```

Capability checks let a desktop hide or degrade features on hosts that cannot fulfil them. A reported host capability still requires repository permission.

## Applications

```js
const applications = await melly.apps.list();
await melly.apps.launch("terminal");
```

`apps.list()` returns semantic application records suitable for a launcher. `apps.launch(id)` requests an application by stable desktop/application identity, not a shell command.

Required permission: `apps.launch` for launch. The final runtime may define a separate read permission for enumeration.

## Workspaces

```js
const workspaces = await melly.workspaces.list();
await melly.workspaces.activate(workspaces[0].id);
```

Workspace IDs are opaque host-neutral values. Do not parse them or assume they match a Sway workspace number.

Required permissions: `workspaces.read` and `workspaces.control` respectively.

## Windows (planned)

```js
const windows = await melly.windows.list();
await melly.windows.focus(windows[0].id);
```

Window IDs are also opaque. The runtime should return a capability or unsupported-operation error when the active host cannot provide a requested operation.

Required permissions: `windows.read` and `windows.control` respectively.

## Error behavior

Calls are asynchronous and reject with structured Melly errors. UI code should distinguish at least permission denial, unavailable host capability, invalid input, missing object, and temporary backend failure. Exact error names are deferred until the runtime contract is implemented.

Never fall back from an API error to arbitrary shell execution or direct compositor control.
