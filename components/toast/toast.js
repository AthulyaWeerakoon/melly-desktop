import { loadComponent, showComponentError } from "../../scripts/core/component-loader.js";

class MellyToast extends HTMLElement {
  #initializePromise;
  #pendingMessage;
  #timer;

  connectedCallback() {
    this.#initializePromise ??= this.#initialize();
  }

  disconnectedCallback() {
    window.clearTimeout(this.#timer);
  }

  show(message) {
    this.#pendingMessage = message;
    if (this.shadowRoot?.querySelector(".toast")) {
      this.#displayPendingMessage();
    }
  }

  async #initialize() {
    try {
      await loadComponent(this, import.meta.url, "toast");
      this.#displayPendingMessage();
    } catch (error) {
      showComponentError(this, "Status message", error);
    }
  }

  #displayPendingMessage() {
    if (!this.#pendingMessage) {
      return;
    }
    const toast = this.shadowRoot.querySelector(".toast");
    window.clearTimeout(this.#timer);
    toast.textContent = this.#pendingMessage;
    toast.hidden = false;
    this.#pendingMessage = "";
    this.#timer = window.setTimeout(() => {
      toast.hidden = true;
    }, 3400);
  }
}

customElements.define("melly-toast", MellyToast);
