# Melly Desktop

Melly Desktop is the reference desktop-source repository for the [Melly native runtime](https://github.com/AthulyaWeerakoon/melly). It demonstrates how the interface surface Melly defines can be programmed completely with ordinary HTML, CSS, and JavaScript and activated at runtime without recompiling Melly.

Melly guarantees only the semantic behavior defined by its contract. Linux, Wayland, and host-compositor features outside that contract are optional capabilities or unsupported operations. Desktop source remains portable and usable in browser preview without native integration.

Initial X11 applications are host-managed by Sway/XWayland outside Melly's proxy. They remain usable and do not receive a guarantee of Melly HTML chrome or the full `melly.windows` contract.

## Status

This is an early, browser-previewable sample. The native runtime and its manifest loader are not implemented yet, so `melly.toml` and the `melly.*` API describe the intended contract and may evolve before the first compatibility release.

The sample is a component-driven single-page application with desktop tabs, a window layer, launcher, dock, status toast, Files and Settings tools, and a small mock of the future native API. The mock makes browser preview possible; Melly will provide the real API in a native session.

## Preview locally

No install or build step is required. Serve the repository through a local HTTP server:

```sh
python3 -m http.server 8080
```

Then open <http://localhost:8080>. Direct `file://` preview is unsupported.

Try `Super` or `Ctrl+Space` to open the launcher, open Files or Settings as HTML tool windows, drag or maximize a window, and switch desktop tabs from the panel. Preview native launches are simulated and shown in the status toast.

## Structure

```text
melly-desktop/
├── melly.toml                  # draft shell manifest and permissions
├── index.html                  # minimal SPA entry document
├── styles/desktop.css          # document-level reset and loading fallback
├── scripts/
│   ├── desktop.js              # custom-element bootstrap
│   ├── catalog/tools.js        # built-in tool registry and dock catalog
│   ├── core/                   # component loader and event vocabulary
│   ├── services/melly-client.js# permission-aware native/preview boundary
│   └── state/desktop-store.js  # desktops, windows, focus, and preferences
├── components/
│   ├── desktop-app/            # root coordinator
│   ├── desktop-tabs/           # local desktop navigation
│   ├── desktop-surface/        # active desktop and empty state
│   ├── window-manager/         # keyed window/tool composition
│   ├── app-window/             # reusable window frame
│   ├── file-explorer/          # explicitly preview-only Files tool
│   ├── settings/               # in-memory desktop preferences
│   ├── panel/
│   ├── dock/
│   ├── launcher/
│   └── toast/
├── tests/desktop-store.test.mjs
└── docs/
    ├── authoring.md
    ├── manifest.md
    ├── native-api.md
    └── spa-architecture.md
```

## Design constraints

- Keep all Melly-owned visual structure, styling, data binding, and interaction customization in HTML, CSS, and JavaScript; package and permission metadata is not a second UI language.
- Use web-platform features and ES modules directly; no Node.js runtime or bundler is required.
- Keep native calls under the semantic `melly.*` namespace.
- Depend only on the documented minimum Melly contract; detect optional capabilities and degrade explicitly when an operation is unavailable.
- Treat permissions as explicit, default-deny native authority.
- Keep every runtime asset local; online asset and source dependencies are forbidden.
- Resolve every loaded interface file beneath the desktop root containing `index.html`; traversal and symlink escapes are invalid.
- Use permission-gated AJAX only for untrusted data exchange with approved localhost or outbound endpoints, never for interface assets or executable source.
- Perform native or host-changing operations only through authorized `melly.*` APIs. A localhost helper acts solely with its own operating-system permissions.
- Make changes accessible, keyboard-operable, and recoverable through Git.

Start with the [SPA architecture](docs/spa-architecture.md) and [authoring guide](docs/authoring.md), then see the draft [manifest](docs/manifest.md) and [native API](docs/native-api.md) references. Contributors and coding agents should also read [AGENTS.md](AGENTS.md).
