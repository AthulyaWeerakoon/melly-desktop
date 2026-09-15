import { loadComponent, showComponentError } from "../../scripts/core/component-loader.js";
import { desktopEvents, emitDesktopEvent } from "../../scripts/core/events.js";

class MellySettings extends HTMLElement {
  #initializePromise;
  #preferences = {
    accent: "cyan",
    compactWindows: false,
    reducedMotion: false,
  };

  set preferences(value) {
    this.#preferences = { ...this.#preferences, ...value };
    this.#render();
  }

  connectedCallback() {
    this.#initializePromise ??= this.#initialize();
  }

  async #initialize() {
    try {
      const root = await loadComponent(this, import.meta.url, "settings");
      root.querySelectorAll('input[name="accent"]').forEach((input) => {
        input.addEventListener("change", () => {
          if (input.checked) {
            emitDesktopEvent(this, desktopEvents.updatePreference, {
              key: "accent",
              value: input.value,
            });
          }
        });
      });
      root.querySelectorAll("[data-preference]").forEach((input) => {
        input.addEventListener("change", () => {
          emitDesktopEvent(this, desktopEvents.updatePreference, {
            key: input.dataset.preference,
            value: input.checked,
          });
        });
      });
      this.#render();
    } catch (error) {
      showComponentError(this, "Settings", error);
    }
  }

  #render() {
    if (!this.shadowRoot) {
      return;
    }
    this.shadowRoot.querySelectorAll('input[name="accent"]').forEach((input) => {
      input.checked = input.value === this.#preferences.accent;
    });
    this.shadowRoot.querySelector('[data-preference="compactWindows"]').checked =
      this.#preferences.compactWindows;
    this.shadowRoot.querySelector('[data-preference="reducedMotion"]').checked =
      this.#preferences.reducedMotion;
  }
}

customElements.define("melly-settings", MellySettings);
