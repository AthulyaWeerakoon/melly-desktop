# Native JavaScript API (draft)

Melly's design defines three distinct host-neutral native namespaces:

- `globalThis.melly` describes Melly itself: environment and version information, read-only inspection of granted permissions, Melly runtime configuration, and runtime status and lifecycle.
- `globalThis.desktop` describes and controls the programmable desktop scene: client surfaces, layout-facing state, focus, outputs, input and seat semantics, and desktop events.
- `globalThis.system` contains permission-gated operating-system services such as application inventory and launch, files, audio, power, and devices.

Existing web concepts continue to use standard web APIs. None of these namespaces exposes compositor commands, D-Bus messages, shell commands, raw Wayland objects, or backend-specific handles.

The browser preview implements only the subset used by the current desktop and does not provide real native authority.

The namespace ownership above is the current design decision. Method names and example capability strings below remain drafts until implemented, tested, and versioned; the browser mock does not constitute a native implementation.

The native desktop host supplies all three namespaces and communicates with the Melly runtime through the authorized native boundary. The Melly command shell is a separate client of the Rust `rusty-melly` SDK and local Unix-domain socket. This transport is not part of the desktop-authoring contract. Desktop JavaScript must not open the socket, encode its wire protocol, or depend on its filesystem path.

Desktop JavaScript receives no ambient filesystem, process, service, compositor, or machine-configuration authority. It may change its DOM and use documented web APIs within the renderer sandbox. Every native effect outside that sandbox requires a documented operation in the appropriate namespace, a matching fine-grained `melly.toml` permission, a supported capability, and runtime authorization.

Loaded interface resources are confined to the desktop root containing the entry document. Network-enabled `fetch` and XHR are data channels, not resource-loading or privilege channels. A localhost service remains a separate process acting with its own operating-system permissions; calling it does not lend it Melly's authority.

## Contract boundary

The APIs cover only semantics Melly can honor according to a documented contract. `melly.*` is introspection and control of Melly itself, not a catch-all native API. `desktop.*` owns the scene and client-surface model. `system.*` describes operating-system services without leaking their Linux implementation. Public object identities, state, methods, events, and errors remain backend-neutral.

The eventual versioned API distinguishes a small minimum environment required of every supported Melly host from optional capabilities. Publish a semantic operation only after its minimum behavior, authorization, failure behavior, and backend-neutral data model are specified and tested. Hosts that cannot provide the minimum contract are unsupported.

## Environment discovery

The exact Melly self-description contract is not versioned yet. A future asynchronous operation such as `await melly.getEnvironment()` may identify the runtime and contract version. Granted-permission inspection belongs here but must not let page code approve its own permission requests. Melly configuration means runtime configuration, not desktop layout, theme, or other HTML-owned presentation policy. Method names and configuration mutability remain undecided. Desktop scene events belong to `desktop.*`, not to Melly self-description. These are design boundaries, not implemented APIs.

Desktop code must still feature-detect the specific operation it needs. Objects named `melly`, `desktop`, and `system` may be browser-preview mocks, and a native environment may support only part of a draft API. Absence, an unsupported result, or a rejected native call must preserve the browser/degraded interface and report clearly that no native action occurred.

## Application and client-surface boundary

Native Wayland applications connect to Melly's application-facing Wayland server. Melly represents their application-owned content as client surfaces inside the programmable HTML scene. Unsupported protocols fail explicitly rather than bypassing Melly through the display host. X11 and XWayland are not supported.

The fundamental foreign-UI concept is a client surface, not a conventional window. A desktop may place `<client-surface>` inside HTML window chrome, a CSS grid, a card, a spatial canvas, or another layout. The exact JavaScript names remain provisional, but Core APIs must expose unavoidable application and protocol state without imposing a fixed window-management policy.

## Capabilities

```js
if (desktop.capabilities.has("client-surfaces.focus")) {
  // Offer focus controls for application client surfaces.
}
```

Capability checks let a desktop hide or degrade features the runtime cannot fulfil. A reported capability is not a permission grant. Scene capabilities are queried on `desktop.*`; system-service capabilities are queried on `system.*`, for example `system.capabilities.has("apps.launch")`. Melly's own permissions and configuration are inspected through `melly.*` when those contracts are defined.

Capabilities represent optional behavior outside the required core. Desktop code uses semantic capabilities such as `outputs.scale` and does not use compositor names for ordinary interface logic. Host names, when exposed, are diagnostic information.

## System services

Operating-system services live under `system.*`; adding a native service does not automatically make it a Melly-specific API. Each callable authority has a separate manifest permission. Read, write, launch, control, and administrative operations are not bundled into a broad `system` grant.

### Applications

```js
const applications = await system.apps.list();
await system.apps.launch("terminal");
```

`apps.list()` returns semantic application records suitable for a launcher. `apps.launch(id)` requests an application by stable desktop/application identity, not a shell command.

Required permissions: `system.apps.list` for enumeration and `system.apps.launch` for launch.

### Files (planned)

File access belongs under `system.files`, not `melly.*`. Listing, reading, creating, changing, moving, and deleting receive distinct authority. Permissions also constrain approved roots or user-selected handles; no operation grants ambient filesystem access.

## Client surfaces (planned)

```js
const surfaces = await desktop.clientSurfaces.list();
await desktop.clientSurfaces.focus(surfaces[0].id);
```

Client-surface IDs are opaque Melly values. They do not expose `wl_surface`, `xdg_toplevel`, Sway container, or other backend identifiers. Servo layout determines where an associated `<client-surface>` region appears; Melly maps the real application buffer and input to that region.

The names and permissions are not versioned yet. Conventional workspaces and windows can be implemented as HTML state and layout around client surfaces; they do not require mandatory Core collections.

## Error behavior

Calls are asynchronous and reject with structured errors. UI code should distinguish at least permission denial, unavailable capability, invalid input, missing object, and temporary backend failure. Exact error names are deferred until the runtime contract is implemented.

Never fall back from an API error to arbitrary shell execution or direct compositor control.
