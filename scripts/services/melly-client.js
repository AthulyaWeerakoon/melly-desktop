const previewApplications = Object.freeze([
  { id: "terminal", name: "Terminal", description: "Open a command line", icon: ">_" },
  { id: "browser", name: "Browser", description: "Open the web browser", icon: "◎" },
  { id: "editor", name: "Editor", description: "Edit source code", icon: "{ }" },
]);

let installedPreview = false;

export function installBrowserPreview() {
  if (globalThis.melly) {
    return false;
  }

  installedPreview = true;
  globalThis.melly = Object.freeze({
    apps: Object.freeze({
      list: async () => structuredClone(previewApplications),
      launch: async () => undefined,
    }),
    capabilities: Object.freeze({
      has: (capability) => ["apps.launch"].includes(capability),
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

export class MellyClient {
  #api;
  #preview;

  constructor(api = globalThis.melly, preview = installedPreview) {
    this.#api = api;
    this.#preview = preview;
  }

  get environmentLabel() {
    return this.#preview ? "Browser preview" : "Melly session";
  }

  async listApplications() {
    if (typeof this.#api?.apps?.list !== "function") {
      return structuredClone(previewApplications).map(normalizeApplication);
    }

    try {
      const applications = await this.#api.apps.list();
      return Array.isArray(applications)
        ? applications.map(normalizeApplication).filter(Boolean)
        : [];
    } catch {
      return [];
    }
  }

  async launchApplication(application) {
    const name = application.name ?? application.id;
    const canLaunch = this.#api?.capabilities?.has?.("apps.launch") === true;
    if (!canLaunch || typeof this.#api?.apps?.launch !== "function") {
      return `Preview only: launching ${name} is unavailable.`;
    }

    try {
      await this.#api.apps.launch(application.id);
      return this.#preview
        ? `Preview only: launching ${name}.`
        : `Launch requested: ${name}.`;
    } catch (error) {
      const reason = error instanceof Error ? error.message : "native operation failed";
      return `Could not launch ${name}: ${reason}`;
    }
  }
}

export function createMellyClient() {
  return new MellyClient();
}
