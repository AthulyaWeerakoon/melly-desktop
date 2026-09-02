# Melly Desktop

Melly Desktop is the reference desktop-source repository for the [Melly native runtime](https://github.com/AthulyaWeerakoon/melly). It demonstrates how a programmable desktop can be authored with ordinary HTML, CSS, and JavaScript and activated at runtime without recompiling Melly.

## Status

This is an early, browser-previewable sample. The native runtime and its manifest loader are not implemented yet, so `melly.toml` and the `melly.*` API describe the intended contract and may evolve before the first compatibility release.

The sample includes a panel, workspace controls, launcher, dock, status toast, and a small mock of the future native API. The mock makes browser preview possible; Melly will provide the real API in a native session.

## Preview locally

No install or build step is required. Serve the repository because its ES modules fetch component HTML and CSS:

```sh
python3 -m http.server 8080
```

Then open <http://localhost:8080>. Opening `index.html` directly with a `file://` URL will not work reliably because browsers restrict module resource loading from local files.

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

- Use web-platform features and ES modules directly; no Node.js runtime or bundler is required.
- Keep native calls under the semantic `melly.*` namespace.
- Detect capabilities and degrade gracefully when an operation is unavailable.
- Treat permissions as explicit, default-deny native authority.
- Keep local assets as the baseline; network access is not implicitly trusted.
- Make changes accessible, keyboard-operable, and recoverable through Git.

Start with the [authoring guide](docs/authoring.md), then see the draft [manifest](docs/manifest.md) and [native API](docs/native-api.md) references. Contributors and coding agents should also read [AGENTS.md](AGENTS.md).
