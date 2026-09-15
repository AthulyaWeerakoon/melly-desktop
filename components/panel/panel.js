import { loadComponent, showComponentError } from "../../scripts/core/component-loader.js";
import { desktopEvents, emitDesktopEvent } from "../../scripts/core/events.js";

class MellyPanel extends HTMLElement {
  #clockTimer;
  #desktopState;
  #environmentLabel = "Desktop";
  #initializePromise;

  set desktopState(value) {
    this.#desktopState = value;
    const tabs = this.shadowRoot?.querySelector("melly-desktop-tabs");
    if (tabs) {
      tabs.desktopState = value;
    }
  }

  set environmentLabel(value) {
    this.#environmentLabel = value;
    const label = this.shadowRoot?.querySelector(".environment");
    if (label) {
      label.textContent = value;
    }
  }

  connectedCallback() {
    this.#initializePromise ??= this.#initialize();
    void this.#initializePromise.then(() => this.#startClock());
  }

  disconnectedCallback() {
    window.clearInterval(this.#clockTimer);
    this.#clockTimer = undefined;
  }

  async #initialize() {
    try {
      const root = await loadComponent(this, import.meta.url, "panel");
      root.querySelector(".launcher-button").addEventListener("click", () => {
        emitDesktopEvent(this, desktopEvents.openLauncher);
      });
      root.querySelector(".environment").textContent = this.#environmentLabel;
      root.querySelector("melly-desktop-tabs").desktopState = this.#desktopState;
      this.#updateClock();
    } catch (error) {
      showComponentError(this, "Panel", error);
    }
  }

  #startClock() {
    if (!this.isConnected || this.#clockTimer) {
      return;
    }
    this.#updateClock();
    this.#clockTimer = window.setInterval(() => this.#updateClock(), 30_000);
  }

  #updateClock() {
    const time = this.shadowRoot?.querySelector("time");
    if (!time) {
      return;
    }
    const now = new Date();
    time.dateTime = now.toISOString();
    time.textContent = new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
    }).format(now);
  }
}

customElements.define("melly-panel", MellyPanel);
