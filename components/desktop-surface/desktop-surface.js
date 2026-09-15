import { loadComponent, showComponentError } from "../../scripts/core/component-loader.js";
import { desktopEvents, emitDesktopEvent } from "../../scripts/core/events.js";

class MellyDesktopSurface extends HTMLElement {
  #desktopState;
  #initializePromise;

  set desktopState(value) {
    this.#desktopState = value;
    this.#render();
  }

  connectedCallback() {
    this.#initializePromise ??= this.#initialize();
  }

  async #initialize() {
    try {
      const root = await loadComponent(this, import.meta.url, "desktop-surface");
      root.querySelectorAll("[data-tool-id]").forEach((button) => {
        button.addEventListener("click", () => {
          emitDesktopEvent(this, desktopEvents.openTool, { toolId: button.dataset.toolId });
        });
      });
      root.querySelector("[data-open-launcher]").addEventListener("click", () => {
        emitDesktopEvent(this, desktopEvents.openLauncher);
      });
      this.#render();
    } catch (error) {
      showComponentError(this, "Desktop surface", error);
    }
  }

  #render() {
    if (!this.shadowRoot || !this.#desktopState) {
      return;
    }
    const activeWindows = this.#desktopState.windows.filter(
      ({ desktopId }) => desktopId === this.#desktopState.activeDesktopId,
    );
    const activeDesktop = this.#desktopState.desktops.find(
      ({ id }) => id === this.#desktopState.activeDesktopId,
    );
    const surface = this.shadowRoot.querySelector(".desktop-surface");
    surface.setAttribute("aria-label", `${activeDesktop?.name ?? "Active"} desktop`);
    this.shadowRoot.querySelector(".empty-state").hidden = activeWindows.length > 0;
    this.shadowRoot.querySelector("melly-window-manager").desktopState = this.#desktopState;
  }
}

customElements.define("melly-desktop-surface", MellyDesktopSurface);
