# Melly Desktop

Melly Desktop is the reference desktop-source repository for the [Melly native runtime](https://github.com/AthulyaWeerakoon/melly). It demonstrates how the interface surface Melly defines can be programmed completely with ordinary HTML, CSS, and JavaScript and activated at runtime without recompiling Melly.

Melly guarantees only the semantic behavior defined by its contract. Linux, Wayland, and host-compositor features outside that contract are optional capabilities or unsupported operations. Desktop source remains portable and usable in browser preview without native integration.

Initial X11 applications are host-managed by Sway/XWayland outside Melly's proxy. They remain usable and do not receive a guarantee of Melly HTML chrome or the full `melly.windows` contract.

## Status

This is an early, browser-previewable sample. The native runtime and its manifest loader are not implemented yet, so `melly.toml` and the `melly.*` API describe the intended contract and may evolve before the first compatibility release.

The sample includes a panel, workspace controls, launcher, dock, status toast, and a small mock of the future native API. The mock makes browser preview possible; Melly will provide the real API in a native session.

## Preview locally

No install or build step is required. Serve the repository through a local HTTP server:

```sh
python3 -m http.server 8080
```

Then open <http://localhost:8080>. Direct `file://` preview is unsupported.

Try `Super` or `Ctrl+Space` to open the launcher, type to filter applications, and press `Escape` to close it. Preview launches are simulated and shown in the status toast.

## Structure

```text
melly-desktop/
├── melly.toml                  # draft shell manifest and permissions
├── index.html                  # desktop entry document
├── styles/desktop.css          # shared theme and desktop layout
├── scripts/desktop.js          # component bootstrap and browser API mock
├── components/
│   ├── panel/
│   │   ├── panel.html
│   │   ├── panel.css
│   │   └── panel.js
│   └── launcher/
│       ├── launcher.html
│       ├── launcher.css
│       └── launcher.js
└── docs/
    ├── authoring.md
    ├── manifest.md
    └── native-api.md
```

## Design constraints

- Keep all Melly-owned visual structure, styling, data binding, and interaction customization in HTML, CSS, and JavaScript; package and permission metadata is not a second UI language.
- Use web-platform features and ES modules directly; no Node.js runtime or bundler is required.
- Keep native calls under the semantic `melly.*` namespace.
- Depend only on the documented minimum Melly contract; detect optional capabilities and degrade explicitly when an operation is unavailable.
- Treat permissions as explicit, default-deny native authority.
- Keep every runtime asset local; online asset and source dependencies are forbidden.
- Make changes accessible, keyboard-operable, and recoverable through Git.

Start with the [authoring guide](docs/authoring.md), then see the draft [manifest](docs/manifest.md) and [native API](docs/native-api.md) references. Contributors and coding agents should also read [AGENTS.md](AGENTS.md).
