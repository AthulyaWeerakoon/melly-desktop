const mockApplications = [
  { id: "terminal", name: "Terminal", description: "Open a command line", icon: ">_" },
  { id: "files", name: "Files", description: "Browse local files", icon: "▰" },
  { id: "browser", name: "Browser", description: "Open the web browser", icon: "◎" },
  { id: "editor", name: "Editor", description: "Edit source code", icon: "{ }" },
  { id: "settings", name: "Settings", description: "Configure the session", icon: "⚙" },
];

function installBrowserMock() {
  if (globalThis.melly) {
    return false;
  }

  globalThis.melly = Object.freeze({
    apps: Object.freeze({
      list: async () => structuredClone(mockApplications),
      launch: async (applicationId) => {
        const application = mockApplications.find(({ id }) => id === applicationId);
        const name = application?.name ?? applicationId;
        window.dispatchEvent(
          new CustomEvent("melly:notice", {
            detail: `Preview only: requested launch of ${name}.`,
          }),
        );
      },
    }),
    capabilities: Object.freeze({
      has: (capability) =>
        ["apps.launch", "windows.read", "workspaces.read", "workspaces.control"].includes(capability),
    }),
    workspaces: Object.freeze({
      activate: async (workspaceId) => {
        window.dispatchEvent(
          new CustomEvent("melly:workspace-active", { detail: { id: workspaceId } }),
        );
      },
      list: async () => [
        { id: "1", name: "Code", active: true },
        { id: "2", name: "Web", active: false },
        { id: "3", name: "Chat", active: false },
      ],
    }),
  });

  return true;
}

const usingBrowserMock = installBrowserMock();

await Promise.all([
  import("../components/panel/panel.js"),
  import("../components/launcher/launcher.js"),
]);

const toast = document.querySelector(".toast");
let toastTimer;

function showNotice(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = window.setTimeout(() => {
    toast.hidden = true;
  }, 3200);
}

function openLauncher() {
  window.dispatchEvent(new CustomEvent("melly:launcher-open"));
}

document.querySelector("[data-open-launcher]").addEventListener("click", openLauncher);

document.querySelectorAll("[data-launch-app]").forEach((button) => {
  button.addEventListener("click", async () => {
    await globalThis.melly.apps.launch(button.dataset.launchApp);
  });
});

window.addEventListener("melly:notice", (event) => showNotice(event.detail));

window.addEventListener("keydown", (event) => {
  const launcherShortcut = event.key === " " && event.ctrlKey;
  const superShortcut = event.key === "Meta" && !event.repeat;

  if (launcherShortcut || superShortcut) {
    event.preventDefault();
    openLauncher();
  }
});

if (usingBrowserMock) {
  showNotice("Browser preview is using the local melly.* mock API.");
}
