export const desktopEvents = Object.freeze({
  activateDesktop: "melly:desktop-activate",
  addDesktop: "melly:desktop-add",
  closeLauncher: "melly:launcher-close",
  closeWindow: "melly:window-close",
  focusWindow: "melly:window-focus",
  launchApplication: "melly:application-launch",
  moveWindow: "melly:window-move",
  notice: "melly:notice",
  openLauncher: "melly:launcher-open",
  openTool: "melly:tool-open",
  toggleWindowMaximize: "melly:window-maximize-toggle",
  updatePreference: "melly:preference-update",
});

export function emitDesktopEvent(source, type, detail = {}) {
  source.dispatchEvent(
    new CustomEvent(type, {
      bubbles: true,
      composed: true,
      detail,
    }),
  );
}
