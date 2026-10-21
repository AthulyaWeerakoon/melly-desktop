# Manifest reference (draft)

`melly.toml` is package identity, entry-point, and permission metadata. It is not the desktop customization interface. Visual structure, surface organization, styling, bindings, and interaction behavior belong in HTML, CSS, and JavaScript; the manifest must not become a parallel UI language.

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
name = "Melly Desktop"
entry = "index.html"
```

- `name` is the human-readable package name.
- `entry` is the local fallback/primary document. Its containing directory is the desktop resource root, and the entry must resolve inside the installed desktop package.

## Permissions

```toml
[permissions]
"system.apps.list" = true
"system.apps.launch" = true
"network.http" = false
```

Permissions request authority; they do not grant it. Installation policy or the user must approve them. Setting a capability to `true` does not approve it. Permission names identify individual authorities rather than granting a broad namespace: `system.apps.list` does not grant `system.apps.launch`, and neither grants files, process control, audio, power, or device access.

Client-surface permissions are deferred until their JavaScript and element contracts are versioned. Conventional windows and workspaces are reference-desktop presentation policy and do not receive mandatory Core permission families.

Unknown permissions and permission expansion fail validation or require explicit approval. Filesystem permissions, when specified, separate operations such as listing, reading, creating, changing, moving, and deleting, and constrain them to approved roots or user-selected handles. They never grant general shell access.

`network.http` governs AJAX data requests, including requests to localhost. It does not allow remote or localhost-hosted scripts, modules, styles, markup, fonts, images, templates, or other interface assets. A future origin policy may narrow approved endpoints without changing the package-local asset rule.

Network permission is not filesystem permission. A separate localhost service acts with its own operating-system identity and authorization when it changes a file in response to a request; it does not inherit Melly runtime authority.

Manifest entry paths are resolved canonically beneath the desktop root. Validation rejects absolute paths, parent traversal, symlink escapes, and any alternate path that resolves outside the root. Panels, overlays, client-surface placement, and other scene structure are defined by the entry document rather than manifest fields.
