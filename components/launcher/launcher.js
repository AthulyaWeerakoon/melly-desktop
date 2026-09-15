import { loadComponent, showComponentError } from "../../scripts/core/component-loader.js";
import { desktopEvents, emitDesktopEvent } from "../../scripts/core/events.js";

class MellyLauncher extends HTMLElement {
  #initializePromise;
  #items = [];
  #previousFocus;

  set items(value) {
    this.#items = Array.isArray(value) ? value : [];
    this.#render(this.#items);
  }

  connectedCallback() {
    this.#initializePromise ??= this.#initialize();
  }

  async #initialize() {
    try {
      const root = await loadComponent(this, import.meta.url, "launcher");
      root.querySelector(".close-button").addEventListener("click", () => this.#requestClose());
      root.querySelector(".backdrop").addEventListener("click", (event) => {
        if (event.target.classList.contains("backdrop")) {
          this.#requestClose();
        }
      });
      root.querySelector("input").addEventListener("input", (event) => {
        const query = event.target.value.trim().toLocaleLowerCase();
        const matches = this.#items.filter((item) =>
          `${item.name} ${item.description ?? ""}`.toLocaleLowerCase().includes(query),
        );
        this.#render(matches);
      });
      root.addEventListener("keydown", (event) => this.#handleDialogKey(event));
      this.#render(this.#items);
    } catch (error) {
      showComponentError(this, "Launcher", error);
      this.hidden = false;
    }
  }

  open() {
    this.#previousFocus = document.activeElement;
    this.hidden = false;
    queueMicrotask(() => this.shadowRoot?.querySelector("input")?.focus());
  }

  close() {
    this.hidden = true;
    const input = this.shadowRoot?.querySelector("input");
    if (input) {
      input.value = "";
      this.#render(this.#items);
    }
    this.#previousFocus?.focus?.();
  }

  #requestClose() {
    emitDesktopEvent(this, desktopEvents.closeLauncher);
  }

  #render(items) {
    const list = this.shadowRoot?.querySelector(".application-list");
    const emptyState = this.shadowRoot?.querySelector(".empty-state");
    if (!list || !emptyState) {
      return;
    }

    list.replaceChildren(
      ...items.map((item) => {
        const listItem = document.createElement("li");
        const button = document.createElement("button");
        const icon = document.createElement("span");
        const copy = document.createElement("span");
        const name = document.createElement("span");
        const kind = document.createElement("span");
        const description = document.createElement("span");

        button.type = "button";
        button.dataset.itemId = item.id;
        icon.className = "application-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = item.icon ?? "•";
        copy.className = "application-copy";
        name.className = "application-name";
        name.textContent = item.name;
        kind.className = "item-kind";
        kind.textContent = item.kind === "tool" ? "Desktop tool" : "Application";
        description.className = "application-description";
        description.textContent = item.description ?? "";
        name.append(kind);
        copy.append(name, description);
        button.append(icon, copy);
        button.addEventListener("click", () => this.#activate(item));
        listItem.append(button);
        return listItem;
      }),
    );
    emptyState.hidden = items.length !== 0;
  }

  #activate(item) {
    if (item.kind === "tool") {
      emitDesktopEvent(this, desktopEvents.openTool, { toolId: item.id });
    } else {
      emitDesktopEvent(this, desktopEvents.launchApplication, { applicationId: item.id });
    }
    this.#requestClose();
  }

  #handleDialogKey(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      this.#requestClose();
      return;
    }
    if (event.key !== "Tab") {
      return;
    }

    const focusable = Array.from(
      this.shadowRoot.querySelectorAll('button:not([disabled]), input:not([disabled]), [tabindex="0"]'),
    ).filter((element) => !element.hidden);
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && this.shadowRoot.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && this.shadowRoot.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

customElements.define("melly-launcher", MellyLauncher);
