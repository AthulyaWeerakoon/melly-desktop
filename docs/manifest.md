# Manifest reference (draft)

`melly.toml` describes shell-level behavior and requested native authority. HTML should not need to understand Wayland anchors, exclusive zones, or installation permissions.

The schema is provisional until the native loader is implemented and versioned.

## Top level

```toml
manifest_version = 1
```

An unsupported version must be rejected before activation rather than interpreted approximately.

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
- `keyboard` describes keyboard-interactivity policy. The current sample uses `on-demand` because its launcher needs focus.

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

Permissions request authority; they do not grant it by themselves. Installation policy or the user must approve them. A repository update cannot silently acquire a capability merely by setting it to `true`.

Unknown permissions and permission expansion should fail validation or require explicit approval. Filesystem entries, when supported, must be constrained paths rather than general shell access.
