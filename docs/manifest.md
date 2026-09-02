# Manifest reference (draft)

`melly.toml` is package, entry-point, surface-intent, and permission metadata. It is not the desktop customization interface. Visual structure, styling, bindings, and ordinary interaction behavior belong in HTML, CSS, and JavaScript; the manifest must not become a parallel UI language.

Metadata selects local entry files and requests native authority. Raw Wayland, Sway, D-Bus, and native-code configuration are outside desktop interface customization.

The schema is provisional until the native loader is implemented and versioned.

## Top level

```toml
manifest_version = 1
```

Reject an unsupported version before activation.

## Desktop

```toml
[desktop]
name = "Melly Reference Desktop"
entry = "index.html"
```

- `name` is the human-readable package name.
- `entry` is the local fallback/primary document and must remain inside the repository.

## Surfaces

```toml
[[surface]]
id = "desktop"
source = "index.html"
role = "background"
anchor = ["top", "right", "bottom", "left"]
keyboard = "on-demand"
```

- `id` is stable within the repository.
- `source` points to a local HTML document.
- `role` expresses shell intent such as `background`, `panel`, or `overlay`; it is not a compositor-specific layer name.
- `anchor` accepts logical screen edges.
- `keyboard` describes keyboard-interactivity policy. The current sample uses `on-demand`.

Future multi-surface manifests may give a panel an `exclusive_zone` and define a launcher as a separate overlay document. Those fields must remain host-neutral.

## Permissions

```toml
[permissions]
"apps.launch" = true
"windows.read" = true
"windows.control" = false
"workspaces.read" = true
"workspaces.control" = true
"network.http" = false
filesystem = []
```

Permissions request authority; they do not grant it. Installation policy or the user must approve them. Setting a capability to `true` does not approve it.

Unknown permissions and permission expansion fail validation or require explicit approval. Filesystem entries, when supported, use constrained paths and do not grant general shell access.
