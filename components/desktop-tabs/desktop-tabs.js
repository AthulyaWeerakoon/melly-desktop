import { loadComponent, showComponentError } from "../../scripts/core/component-loader.js";
import { desktopEvents, emitDesktopEvent } from "../../scripts/core/events.js";

class MellyDesktopTabs extends HTMLElement {
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
      const root = await loadComponent(this, import.meta.url, "desktop-tabs");
      root.querySelector(".add-button").addEventListener("click", () => {
        emitDesktopEvent(this, desktopEvents.addDesktop);
      });
      root.querySelector(".tab-list").addEventListener("keydown", (event) => {
        this.#handleKeyboardNavigation(event);
      });
      this.#render();
    } catch (error) {
      showComponentError(this, "Desktop tabs", error);
    }
  }

  #render() {
    const list = this.shadowRoot?.querySelector(".tab-list");
    if (!list || !this.#desktopState) {
      return;
    }

    list.replaceChildren(
      ...this.#desktopState.desktops.map((desktop) => {
        const button = document.createElement("button");
        const selected = desktop.id === this.#desktopState.activeDesktopId;
        button.type = "button";
        button.id = `tab-${desktop.id}`;
        button.setAttribute("role", "tab");
        button.tabIndex = selected ? 0 : -1;
        button.dataset.desktopId = desktop.id;
        button.setAttribute("aria-selected", String(selected));
        button.textContent = desktop.name;
        button.addEventListener("click", () => {
          emitDesktopEvent(this, desktopEvents.activateDesktop, { desktopId: desktop.id });
        });
        return button;
      }),
    );
  }

  #handleKeyboardNavigation(event) {
    const tabs = Array.from(this.shadowRoot.querySelectorAll('[role="tab"]'));
    const currentIndex = tabs.indexOf(event.target);
    if (currentIndex < 0) {
      return;
    }

    let nextIndex;
    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    tabs[nextIndex].focus();
    tabs[nextIndex].click();
  }
}

customElements.define("melly-desktop-tabs", MellyDesktopTabs);
