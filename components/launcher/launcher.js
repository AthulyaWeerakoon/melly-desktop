const templateUrl = new URL("./launcher.html", import.meta.url);
const stylesheetUrl = new URL("./launcher.css", import.meta.url);

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load ${url.pathname}: ${response.status}`);
  }
  return response.text();
}

class MellyLauncher extends HTMLElement {
  #applications = [];
  #previousFocus;

  async connectedCallback() {
    const root = this.shadowRoot ?? this.attachShadow({ mode: "open" });

    try {
      const [markup, stylesheet] = await Promise.all([
        fetchText(templateUrl),
        fetchText(stylesheetUrl),
      ]);
      root.innerHTML = `<style>${stylesheet}</style>${markup}`;
      await this.#initialize(root);
    } catch (error) {
      root.textContent = `Launcher unavailable: ${error.message}`;
      this.hidden = false;
    }
  }

  async #initialize(root) {
    this.#applications = await globalThis.melly.apps.list();
    this.#renderApplications(root, this.#applications);

    root.querySelector(".close-button").addEventListener("click", () => this.close());
    root.querySelector(".backdrop").addEventListener("click", (event) => {
      if (event.target.classList.contains("backdrop")) {
        this.close();
      }
    });
    root.querySelector("input").addEventListener("input", (event) => {
      const query = event.target.value.trim().toLocaleLowerCase();
      const matches = this.#applications.filter((application) =>
        `${application.name} ${application.description}`.toLocaleLowerCase().includes(query),
      );
      this.#renderApplications(root, matches);
    });

    window.addEventListener("melly:launcher-open", () => this.open());
    window.addEventListener("keydown", (event) => {
      if (!this.hidden && event.key === "Escape") {
        event.preventDefault();
        this.close();
      }
    });
  }

  open() {
    this.#previousFocus = document.activeElement;
    this.hidden = false;
    this.shadowRoot.querySelector("input").focus();
  }

  close() {
    this.hidden = true;
    this.shadowRoot.querySelector("input").value = "";
    this.#renderApplications(this.shadowRoot, this.#applications);
    this.#previousFocus?.focus();
  }

  #renderApplications(root, applications) {
    const list = root.querySelector(".application-list");
    const emptyState = root.querySelector(".empty-state");
    list.replaceChildren();
    emptyState.hidden = applications.length !== 0;

    applications.forEach((application) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      const icon = document.createElement("span");
      const copy = document.createElement("span");
      const name = document.createElement("span");
      const description = document.createElement("span");

      button.type = "button";
      button.dataset.applicationId = application.id;
      icon.className = "application-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = application.icon ?? "•";
      name.className = "application-name";
      name.textContent = application.name;
      description.className = "application-description";
      description.textContent = application.description ?? "";
      copy.append(name, description);
      button.append(icon, copy);
      button.addEventListener("click", async () => {
        await globalThis.melly.apps.launch(application.id);
        this.close();
      });
      item.append(button);
      list.append(item);
    });
  }
}

customElements.define("melly-launcher", MellyLauncher);
