import { loadComponent, showComponentError } from "../../scripts/core/component-loader.js";
import { desktopEvents, emitDesktopEvent } from "../../scripts/core/events.js";

class MellyAppWindow extends HTMLElement {
  #focused = false;
  #initializePromise;
  #windowRecord;

  set windowRecord(value) {
    this.#windowRecord = value;
    this.#render();
  }

  set focused(value) {
    this.#focused = Boolean(value);
    this.dataset.focused = String(this.#focused);
  }

  connectedCallback() {
    this.#initializePromise ??= this.#initialize();
  }

  async #initialize() {
    try {
      const root = await loadComponent(this, import.meta.url, "app-window");
      const titlebar = root.querySelector(".titlebar");
      root.querySelector(".window").addEventListener("pointerdown", () => this.#requestFocus());
      root.querySelector(".close-button").addEventListener("click", () => {
        emitDesktopEvent(this, desktopEvents.closeWindow, { windowId: this.#windowRecord?.id });
      });
      root.querySelector(".maximize-button").addEventListener("click", () => {
        this.#toggleMaximize();
      });
      titlebar.addEventListener("dblclick", (event) => {
        if (!event.target.closest("button")) {
          this.#toggleMaximize();
        }
      });
      titlebar.addEventListener("pointerdown", (event) => this.#beginDrag(event));
      this.#render();
    } catch (error) {
      showComponentError(this, "Window", error);
    }
  }

  #render() {
    if (!this.shadowRoot || !this.#windowRecord) {
      return;
    }

    const { bounds, icon, mode, title, zIndex } = this.#windowRecord;
    this.dataset.mode = mode;
    this.style.setProperty("--window-x", `${bounds.x}px`);
    this.style.setProperty("--window-y", `${bounds.y}px`);
    this.style.setProperty("--window-width", `${bounds.width}px`);
    this.style.setProperty("--window-height", `${bounds.height}px`);
    this.style.setProperty("--window-z", String(zIndex));
    this.shadowRoot.querySelector("h2").textContent = title;
    this.shadowRoot.querySelector(".window-icon").textContent = icon ?? "•";
    const maximizeButton = this.shadowRoot.querySelector(".maximize-button");
    const maximized = mode === "maximized";
    maximizeButton.textContent = maximized ? "❐" : "□";
    maximizeButton.setAttribute("aria-label", maximized ? "Restore window" : "Maximize window");
    maximizeButton.title = maximized ? "Restore" : "Maximize";
  }

  #requestFocus() {
    if (!this.#focused && this.#windowRecord) {
      emitDesktopEvent(this, desktopEvents.focusWindow, { windowId: this.#windowRecord.id });
    }
  }

  #toggleMaximize() {
    if (this.#windowRecord) {
      emitDesktopEvent(this, desktopEvents.toggleWindowMaximize, {
        windowId: this.#windowRecord.id,
      });
    }
  }

  #beginDrag(event) {
    if (
      event.button !== 0 ||
      event.target.closest("button") ||
      !this.#windowRecord ||
      this.#windowRecord.mode !== "floating"
    ) {
      return;
    }

    event.preventDefault();
    this.#requestFocus();
    const titlebar = event.currentTarget;
    const startX = event.clientX;
    const startY = event.clientY;
    const original = this.#windowRecord.bounds;
    titlebar.setPointerCapture(event.pointerId);

    const move = (moveEvent) => {
      this.style.setProperty("--drag-x", `${moveEvent.clientX - startX}px`);
      this.style.setProperty("--drag-y", `${moveEvent.clientY - startY}px`);
    };
    const finish = (finishEvent) => {
      titlebar.removeEventListener("pointermove", move);
      titlebar.removeEventListener("pointerup", finish);
      titlebar.removeEventListener("pointercancel", finish);
      this.style.setProperty("--drag-x", "0px");
      this.style.setProperty("--drag-y", "0px");
      emitDesktopEvent(this, desktopEvents.moveWindow, {
        windowId: this.#windowRecord.id,
        x: original.x + finishEvent.clientX - startX,
        y: original.y + finishEvent.clientY - startY,
      });
    };

    titlebar.addEventListener("pointermove", move);
    titlebar.addEventListener("pointerup", finish);
    titlebar.addEventListener("pointercancel", finish);
  }
}

customElements.define("melly-app-window", MellyAppWindow);
