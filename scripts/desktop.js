import { installBrowserPreview } from "./services/system-client.js";

installBrowserPreview();

await Promise.all([
  import("../components/app-window/app-window.js"),
  import("../components/desktop-tabs/desktop-tabs.js"),
  import("../components/file-explorer/file-explorer.js"),
  import("../components/settings/settings.js"),
  import("../components/toast/toast.js"),
]);

await Promise.all([
  import("../components/dock/dock.js"),
  import("../components/launcher/launcher.js"),
  import("../components/panel/panel.js"),
  import("../components/window-manager/window-manager.js"),
]);

await import("../components/desktop-surface/desktop-surface.js");
await import("../components/desktop-app/desktop-app.js");
