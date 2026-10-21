# Melly Desktop

**A desktop-shaped playground made with the web.** This companion project is the evolving reference interface for [Melly](https://github.com/AthulyaWeerakoon/melly), built with HTML, CSS, and JavaScript—no bundler required.

## Where things stand

Explore a component-driven desktop with tabs, a launcher, dock, Files and Settings tools, and explicit mock actions. This is a browser preview, not a native desktop: the Melly runtime, Servo host, manifest loader, and native bridge are not implemented. The `melly.*`, `desktop.*`, and `system.*` APIs and `melly.toml` are draft contracts. X11 and XWayland are unsupported.

## Preview and apply

From this repository, start a local static server:

```sh
python3 -m http.server 8080
```

Open <http://localhost:8080> in your browser. Direct `file://` preview is unsupported. Try `Super` or `Ctrl+Space` to open the launcher, explore Files or Settings, and switch desktop tabs. Native actions are simulated and reported in the status toast; no action changes the host system.

For now, “apply” means editing the source and refreshing the browser preview. There is no native installation or deployment path yet; applying the desktop to Melly must wait for a working runtime.

## Contribute

See the [authoring guide](docs/authoring.md) for editing and the [SPA architecture](docs/spa-architecture.md) for a high-level orientation. These are the existing contributor-facing guides; no separate contribution workflow is established yet. For deeper implementation boundaries, see the [manifest](docs/manifest.md) and [native API](docs/native-api.md) references.
