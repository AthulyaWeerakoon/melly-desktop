# Desktop authoring guide

## Development loop

Serve the repository with any static HTTP server and edit the source directly:

```sh
python3 -m http.server 8080
```

Refresh the browser during this pre-runtime phase. The planned `melly dev` command will watch the working tree, debounce changes, and reload the document or affected WebView without compiling the native runtime or restarting the desktop session.

## Component model

Each component keeps markup, styling, and behavior under one directory. The reference components load adjacent HTML and CSS from an ES module and render them in Shadow DOM. This is a lightweight convention, not a required framework or a custom JSX toolchain.

Components coordinate through documented DOM events:

- `melly:launcher-open` asks the launcher to show;
- `melly:notice` carries user-visible status text;
- `melly:workspace-active` reports the active workspace in the preview mock.

Native operations do not use these events. They call the permission-checked `melly.*` API described in `native-api.md`.

## Adding a component

1. Create `components/<name>/<name>.html`, `.css`, and `.js`.
2. Define a uniquely named custom element in the module.
3. Load the module from `scripts/desktop.js` or a parent component.
4. Use semantic markup and support keyboard interaction and visible focus.
5. Render native strings with `textContent`, not HTML interpolation.
6. Handle missing capabilities and API failures with a useful degraded state.
7. Add any new native authority explicitly to `melly.toml` and document why it is needed.

## Browser preview versus Melly

The preview installs a small `globalThis.melly` mock only when a native object is absent. It simulates app launches and workspace activation. Do not branch production UI behavior on mock internals: code against the documented API and capability checks so the same source can run under the native runtime.

## Git activation model

During development, a saved file is expected to reload quickly. In deployed mode, a commit is a candidate generation: Melly validates its manifest, sources, and permissions, initializes it separately, and activates it only after a health check. Keep commits focused so changes remain reviewable and rollback remains meaningful.
