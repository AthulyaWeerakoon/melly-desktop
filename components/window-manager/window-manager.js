import { getTool } from "../../scripts/catalog/tools.js";
import { loadComponent, showComponentError } from "../../scripts/core/component-loader.js";

class MellyWindowManager extends HTMLElement {
  #desktopState;
  #initializePromise;
  #windowElements = new Map();

  set desktopState(value) {
    this.#desktopState = value;
    this.#render();
  }

  connectedCallback() {
    this.#initializePromise ??= this.#initialize();
  }

  async #initialize() {
    try {
      await loadComponent(this, import.meta.url, "window-manager");
      this.#render();
    } catch (error) {
      showComponentError(this, "Window manager", error);
    }
  }

  #render() {
    const layer = this.shadowRoot?.querySelector(".window-layer");
    if (!layer || !this.#desktopState) {
      return;
    }

    const currentIds = new Set(this.#desktopState.windows.map(({ id }) => id));
    this.#windowElements.forEach((element, windowId) => {
      if (!currentIds.has(windowId)) {
        element.remove();
        this.#windowElements.delete(windowId);
      }
    });

    this.#desktopState.windows.forEach((windowRecord) => {
      let windowElement = this.#windowElements.get(windowRecord.id);
      if (!windowElement) {
        windowElement = this.#createWindow(windowRecord);
        if (!windowElement) {
          return;
        }
        this.#windowElements.set(windowRecord.id, windowElement);
        layer.append(windowElement);
      }

      windowElement.windowRecord = windowRecord;
      windowElement.focused = windowRecord.id === this.#desktopState.focusedWindowId;
      windowElement.hidden = windowRecord.desktopId !== this.#desktopState.activeDesktopId;

      const toolElement = windowElement.firstElementChild;
      if (windowRecord.toolId === "settings") {
        toolElement.preferences = this.#desktopState.preferences;
      }
    });
  }

  #createWindow(windowRecord) {
    const tool = getTool(windowRecord.toolId);
    if (!tool) {
      return null;
    }

    const windowElement = document.createElement("melly-app-window");
    const toolElement = document.createElement(tool.tagName);
    toolElement.slot = "content";
    windowElement.append(toolElement);
    return windowElement;
  }
}

customElements.define("melly-window-manager", MellyWindowManager);
