const templateUrl = new URL("./panel.html", import.meta.url);
const stylesheetUrl = new URL("./panel.css", import.meta.url);

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load ${url.pathname}: ${response.status}`);
  }
  return response.text();
}

class MellyPanel extends HTMLElement {
  #clockTimer;

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
      root.textContent = `Panel unavailable: ${error.message}`;
    }
  }

  disconnectedCallback() {
    window.clearInterval(this.#clockTimer);
  }

  async #initialize(root) {
    root.querySelector(".launcher-button").addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("melly:launcher-open"));
    });

    const time = root.querySelector("time");
    const updateClock = () => {
      const now = new Date();
      time.dateTime = now.toISOString();
      time.textContent = new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        weekday: "short",
      }).format(now);
    };
    updateClock();
    this.#clockTimer = window.setInterval(updateClock, 30_000);

    await this.#renderWorkspaces(root);
    window.addEventListener("melly:workspace-active", (event) => {
      this.#setActiveWorkspace(root, event.detail.id);
    });
  }

  async #renderWorkspaces(root) {
    const navigation = root.querySelector(".workspaces");

    if (!globalThis.melly.capabilities.has("workspaces.read")) {
      navigation.hidden = true;
      return;
    }

    const workspaces = await globalThis.melly.workspaces.list();
    navigation.replaceChildren();

    workspaces.forEach((workspace) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.workspaceId = workspace.id;
      button.textContent = workspace.name;
      button.setAttribute("aria-current", String(workspace.active));
      button.disabled = !globalThis.melly.capabilities.has("workspaces.control");
      button.addEventListener("click", async () => {
        await globalThis.melly.workspaces.activate(workspace.id);
      });
      navigation.append(button);
    });
  }

  #setActiveWorkspace(root, workspaceId) {
    root.querySelectorAll("[data-workspace-id]").forEach((button) => {
      button.setAttribute("aria-current", String(button.dataset.workspaceId === workspaceId));
    });
  }
}

customElements.define("melly-panel", MellyPanel);
