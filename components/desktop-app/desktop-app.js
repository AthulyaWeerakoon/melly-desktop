import { createLauncherCatalog, dockItems, getTool } from "../../scripts/catalog/tools.js";
import { loadComponent, showComponentError } from "../../scripts/core/component-loader.js";
import { desktopEvents } from "../../scripts/core/events.js";
import { createSystemClient } from "../../scripts/services/system-client.js";
import { desktopStore } from "../../scripts/state/desktop-store.js";

class MellyDesktopApp extends HTMLElement {
  #client = createSystemClient();
  #catalog = [];
  #initializePromise;
  #eventController;
  #unsubscribe;

  connectedCallback() {
    this.#initializePromise ??= this.#initialize();
    void this.#initializePromise.then(() => this.#connect());
  }

  disconnectedCallback() {
    this.#eventController?.abort();
    this.#eventController = undefined;
    this.#unsubscribe?.();
    this.#unsubscribe = undefined;
  }

  async #initialize() {
    try {
      const root = await loadComponent(this, import.meta.url, "desktop-app");
      this.#catalog = createLauncherCatalog(await this.#client.listApplications());
      root.querySelector("melly-launcher").items = this.#catalog;
      root.querySelector("melly-dock").items = dockItems;
      root.querySelector("melly-panel").environmentLabel = this.#client.environmentLabel;
    } catch (error) {
      showComponentError(this, "Desktop", error);
    }
  }

  #connect() {
    if (!this.isConnected || this.#eventController) {
      return;
    }

    this.#eventController = new AbortController();
    const options = { signal: this.#eventController.signal };

    this.addEventListener(desktopEvents.openLauncher, () => this.#openLauncher(), options);
    this.addEventListener(desktopEvents.closeLauncher, () => this.#closeLauncher(), options);
    this.addEventListener(desktopEvents.openTool, (event) => this.#openTool(event.detail), options);
    this.addEventListener(
      desktopEvents.launchApplication,
      (event) => void this.#launchApplication(event.detail),
      options,
    );
    this.addEventListener(
      desktopEvents.activateDesktop,
      (event) => desktopStore.activateDesktop(event.detail?.desktopId),
      options,
    );
    this.addEventListener(desktopEvents.addDesktop, () => desktopStore.addDesktop(), options);
    this.addEventListener(
      desktopEvents.closeWindow,
      (event) => desktopStore.closeWindow(event.detail?.windowId),
      options,
    );
    this.addEventListener(
      desktopEvents.focusWindow,
      (event) => desktopStore.focusWindow(event.detail?.windowId),
      options,
    );
    this.addEventListener(
      desktopEvents.moveWindow,
      (event) => {
        const { windowId, x, y } = event.detail ?? {};
        if (Number.isFinite(x) && Number.isFinite(y)) {
          desktopStore.moveWindow(windowId, { x, y });
        }
      },
      options,
    );
    this.addEventListener(
      desktopEvents.toggleWindowMaximize,
      (event) => desktopStore.toggleWindowMaximize(event.detail?.windowId),
      options,
    );
    this.addEventListener(
      desktopEvents.updatePreference,
      (event) => {
        const { key, value } = event.detail ?? {};
        desktopStore.updatePreference(key, value);
      },
      options,
    );
    this.addEventListener(
      desktopEvents.notice,
      (event) => this.#showNotice(String(event.detail?.message ?? "")),
      options,
    );
    window.addEventListener("keydown", (event) => this.#handleGlobalShortcut(event), options);

    this.#unsubscribe = desktopStore.subscribe((state) => this.#render(state));
    if (this.#client.environmentLabel === "Native actions preview-only") {
      this.#showNotice("Native API unavailable: actions are preview-only.");
    }
  }

  #render(state) {
    const root = this.shadowRoot;
    const shell = root.querySelector(".desktop-shell");
    shell.dataset.accent = state.preferences.accent;
    shell.dataset.compactWindows = String(state.preferences.compactWindows);
    shell.dataset.reducedMotion = String(state.preferences.reducedMotion);

    root.querySelector("melly-panel").desktopState = state;
    root.querySelector("melly-desktop-surface").desktopState = state;
    root.querySelector("melly-dock").desktopState = state;
  }

  #openTool(detail) {
    const tool = getTool(detail?.toolId);
    if (!tool) {
      this.#showNotice("That desktop tool is unavailable.");
      return;
    }
    desktopStore.openTool(tool);
  }

  async #launchApplication(detail) {
    const application = this.#catalog.find(
      (item) => item.kind === "native" && item.id === detail?.applicationId,
    );
    if (!application) {
      this.#showNotice("That application is unavailable.");
      return;
    }
    this.#showNotice(await this.#client.launchApplication(application));
  }

  #openLauncher() {
    this.shadowRoot.querySelector("melly-launcher").open();
  }

  #closeLauncher() {
    this.shadowRoot.querySelector("melly-launcher").close();
  }

  #showNotice(message) {
    if (message) {
      this.shadowRoot?.querySelector("melly-toast")?.show(message);
    }
  }

  #handleGlobalShortcut(event) {
    const launcherShortcut = event.key === " " && event.ctrlKey;
    const superShortcut = event.key === "Meta" && !event.repeat;
    if (launcherShortcut || superShortcut) {
      event.preventDefault();
      this.#openLauncher();
    }
  }
}

customElements.define("melly-desktop-app", MellyDesktopApp);
