# Native JavaScript API (draft)

Melly will expose host-neutral native operations on `globalThis.melly`. The runtime authorizes a call before routing it to a compositor adapter or Linux service. The API is semantic. Desktop code never sends Sway commands or raw Wayland messages.

The browser preview implements only the subset used by the sample and does not provide real native authority.

The native shell communicates with the Melly runtime through the `rusty-melly` Rust client SDK and a local Unix-domain socket. This transport is not part of the desktop-authoring contract. Desktop JavaScript must not open the socket, encode its wire protocol, or depend on its filesystem path; all desktop requests continue through `globalThis.melly`.

## Contract boundary

The API covers only interface and desktop semantics Melly can honor according to a documented contract. It is not a promise of complete control over Linux, every Wayland protocol, or every host compositor. Public object identities, state, methods, events, and errors describe Melly domain concepts; backend objects remain implementation details.

The eventual versioned API distinguishes a small minimum environment required of every supported Melly host from optional capabilities. Publish a semantic operation only after its minimum behavior, authorization, failure behavior, and backend-neutral data model are specified and tested. Hosts that cannot provide the minimum contract are unsupported.

## Environment discovery

The exact environment-discovery contract is not versioned yet. A future asynchronous operation such as `await melly.getEnvironment()` may identify the runtime and contract version, while `melly.addEventListener(...)` may provide EventTarget-style desktop events. These names are design direction, not implemented API.

Desktop code must still feature-detect the specific operation it needs. An object named `melly` may be the browser preview mock, and a native environment may support only part of a draft API. Absence, an unsupported result, or a rejected native call must preserve the browser/degraded interface and report clearly that no native action occurred.

## Application management boundary

The host may run applications outside Melly's proxy. Initial X11 applications use the host compositor's XWayland path. Other unsupported or unsafe-to-mediate cases may use the same host-managed fallback. These applications are compatible but outside the Melly-managed support contract.

The managed window API must not return a host-managed application as though all window operations and events are available. A future diagnostic or limited-observation API may describe such applications explicitly, but its reduced guarantees must be part of its type/state and capabilities. Runtime logs should record why a case bypassed Melly so compatibility gaps can be investigated.

## Capabilities

```js
if (melly.capabilities.has("workspaces.control")) {
  // Show workspace controls.
}
```

Capability checks let a desktop hide or degrade features on hosts that cannot fulfil them. A reported host capability still requires repository permission.

Capabilities represent optional behavior outside the required core. Desktop code uses semantic capabilities such as `outputs.scale` and does not use compositor names for ordinary interface logic. Host names, when exposed, are diagnostic information.

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
