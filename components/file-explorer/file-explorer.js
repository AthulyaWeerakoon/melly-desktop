import { loadComponent, showComponentError } from "../../scripts/core/component-loader.js";

const places = Object.freeze([
  Object.freeze({
    id: "home",
    name: "Home",
    icon: "⌂",
    entries: Object.freeze([
      Object.freeze({ name: "Desktop", kind: "Folder", icon: "▰" }),
      Object.freeze({ name: "Documents", kind: "Folder", icon: "▰" }),
      Object.freeze({ name: "Pictures", kind: "Folder", icon: "▰" }),
      Object.freeze({ name: "Welcome.md", kind: "Document · 2 KB", icon: "◇" }),
    ]),
  }),
  Object.freeze({
    id: "projects",
    name: "Projects",
    icon: "◆",
    entries: Object.freeze([
      Object.freeze({ name: "melly", kind: "Project", icon: "▰" }),
      Object.freeze({ name: "melly-desktop", kind: "Project", icon: "▰" }),
      Object.freeze({ name: "Ideas.md", kind: "Document · 6 KB", icon: "◇" }),
    ]),
  }),
  Object.freeze({
    id: "recent",
    name: "Recent",
    icon: "◷",
    entries: Object.freeze([
      Object.freeze({ name: "Design notes.md", kind: "Document · Today", icon: "◇" }),
      Object.freeze({ name: "Desktop preview", kind: "Folder · Yesterday", icon: "▰" }),
    ]),
  }),
]);

class MellyFileExplorer extends HTMLElement {
  #activePlaceId = "home";
  #compact = false;
  #initializePromise;

  connectedCallback() {
    this.#initializePromise ??= this.#initialize();
  }

  async #initialize() {
    try {
      const root = await loadComponent(this, import.meta.url, "file-explorer");
      root.querySelector(".view-button").addEventListener("click", (event) => {
        this.#compact = !this.#compact;
        event.currentTarget.setAttribute("aria-pressed", String(this.#compact));
        this.#renderEntries();
      });
      this.#renderPlaces();
      this.#renderEntries();
    } catch (error) {
      showComponentError(this, "Files", error);
    }
  }

  #renderPlaces() {
    const navigation = this.shadowRoot.querySelector(".places");
    navigation.replaceChildren(
      ...places.map((place) => {
        const button = document.createElement("button");
        const icon = document.createElement("span");
        const name = document.createElement("span");
        button.type = "button";
        button.dataset.placeId = place.id;
        button.setAttribute("aria-current", place.id === this.#activePlaceId ? "page" : "false");
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = place.icon;
        name.textContent = place.name;
        button.append(icon, name);
        button.addEventListener("click", () => {
          this.#activePlaceId = place.id;
          this.#renderPlaces();
          this.#renderEntries();
        });
        return button;
      }),
    );
  }

  #renderEntries() {
    const place = places.find(({ id }) => id === this.#activePlaceId) ?? places[0];
    const list = this.shadowRoot.querySelector(".file-list");
    this.shadowRoot.querySelector("h3").textContent = place.name;
    this.shadowRoot.querySelector(".path-location").textContent = place.name;
    list.dataset.compact = String(this.#compact);
    list.replaceChildren(
      ...place.entries.map((entry) => {
        const item = document.createElement("div");
        const icon = document.createElement("span");
        const copy = document.createElement("span");
        const name = document.createElement("span");
        const meta = document.createElement("span");
        item.className = "file-item";
        item.setAttribute("role", "listitem");
        icon.className = "file-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = entry.icon;
        name.className = "file-name";
        name.textContent = entry.name;
        meta.className = "file-meta";
        meta.textContent = entry.kind;
        copy.append(name, meta);
        item.append(icon, copy);
        return item;
      }),
    );
  }
}

customElements.define("melly-file-explorer", MellyFileExplorer);
