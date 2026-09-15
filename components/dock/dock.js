import { loadComponent, showComponentError } from "../../scripts/core/component-loader.js";
import { desktopEvents, emitDesktopEvent } from "../../scripts/core/events.js";

class MellyDock extends HTMLElement {
  #desktopState;
  #initializePromise;
  #items = [];

  set items(value) {
    this.#items = Array.isArray(value) ? value : [];
    this.#render();
  }

  set desktopState(value) {
    this.#desktopState = value;
    this.#render();
  }

  connectedCallback() {
    this.#initializePromise ??= this.#initialize();
  }

  async #initialize() {
    try {
      const root = await loadComponent(this, import.meta.url, "dock");
      root.querySelector(".launcher-button").addEventListener("click", () => {
        emitDesktopEvent(this, desktopEvents.openLauncher);
      });
      this.#render();
    } catch (error) {
      showComponentError(this, "Dock", error);
    }
  }

  #render() {
    const container = this.shadowRoot?.querySelector(".items");
    if (!container) {
      return;
    }

    const openTools = new Set(
      (this.#desktopState?.windows ?? [])
        .filter(({ desktopId }) => desktopId === this.#desktopState?.activeDesktopId)
        .map(({ toolId }) => toolId),
    );

    container.replaceChildren(
      ...this.#items.map((item) => {
        const button = document.createElement("button");
        button.type = "button";
        button.title = item.name;
        button.setAttribute("aria-label", `${item.kind === "tool" ? "Open" : "Launch"} ${item.name}`);
        button.dataset.running = String(item.kind === "tool" && openTools.has(item.id));
        button.textContent = item.icon ?? "•";
        button.addEventListener("click", () => {
          const eventName =
            item.kind === "tool" ? desktopEvents.openTool : desktopEvents.launchApplication;
          const detail =
            item.kind === "tool" ? { toolId: item.id } : { applicationId: item.id };
          emitDesktopEvent(this, eventName, detail);
        });
        return button;
      }),
    );
  }
}

customElements.define("melly-dock", MellyDock);
