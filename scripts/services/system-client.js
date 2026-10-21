const previewApplications = Object.freeze([
  { id: "terminal", name: "Terminal", description: "Open a command line", icon: ">_" },
  { id: "browser", name: "Browser", description: "Open the web browser", icon: "◎" },
  { id: "editor", name: "Editor", description: "Edit source code", icon: "{ }" },
]);

let installedPreview = false;

export function installBrowserPreview() {
  if (globalThis.melly || globalThis.desktop || globalThis.system) {
    return false;
  }

  installedPreview = true;
  globalThis.melly = Object.freeze({});
  globalThis.desktop = Object.freeze({
    capabilities: Object.freeze({
      has: () => false,
    }),
  });
  globalThis.system = Object.freeze({
    apps: Object.freeze({
      list: async () => structuredClone(previewApplications),
      launch: async () => undefined,
    }),
    capabilities: Object.freeze({
      has: (capability) => ["apps.list", "apps.launch"].includes(capability),
    }),
  });
  return true;
}

function normalizeApplication(application) {
  if (!application || typeof application.id !== "string" || typeof application.name !== "string") {
    return null;
  }

  return {
    id: application.id,
    name: application.name,
    description:
      typeof application.description === "string" ? application.description : "Native application",
    icon: typeof application.icon === "string" ? application.icon : "•",
    kind: "native",
  };
}

export class SystemClient {
  #system;
  #preview;

  constructor(systemApi = globalThis.system, preview = installedPreview) {
    this.#system = systemApi;
    this.#preview = preview;
  }

  get environmentLabel() {
    return this.#preview ? "Native actions preview-only" : "Melly session";
  }

  async listApplications() {
    if (typeof this.#system?.apps?.list !== "function") {
      return this.#preview ? structuredClone(previewApplications).map(normalizeApplication) : [];
    }

    try {
      const applications = await this.#system.apps.list();
      return Array.isArray(applications)
        ? applications.map(normalizeApplication).filter(Boolean)
        : [];
    } catch {
      return [];
    }
  }

  async launchApplication(application) {
    const name = application.name ?? application.id;
    const canLaunch = this.#system?.capabilities?.has?.("apps.launch") === true;
    if (!canLaunch || typeof this.#system?.apps?.launch !== "function") {
      return `Preview only: launching ${name} is unavailable.`;
    }

    try {
      await this.#system.apps.launch(application.id);
      return this.#preview
        ? `Preview only: launching ${name}.`
        : `Launch requested: ${name}.`;
    } catch (error) {
      const reason = error instanceof Error ? error.message : "native operation failed";
      return `Could not launch ${name}: ${reason}`;
    }
  }
}

export function createSystemClient() {
  return new SystemClient();
}
