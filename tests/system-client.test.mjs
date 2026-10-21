import assert from "node:assert/strict";
import test from "node:test";

import { SystemClient, installBrowserPreview } from "../scripts/services/system-client.js";

test("preview-only state does not claim a browser or native launch", async () => {
  const client = new SystemClient({}, true);

  assert.equal(client.environmentLabel, "Native actions preview-only");
  assert.equal(
    await client.launchApplication({ id: "terminal", name: "Terminal" }),
    "Preview only: launching Terminal is unavailable.",
  );
});

test("an explicitly supplied system bridge retains the Melly session label", async () => {
  const client = new SystemClient(
    {
      capabilities: { has: (name) => name === "apps.launch" },
      apps: { launch: async () => undefined },
    },
    false,
  );

  assert.equal(client.environmentLabel, "Melly session");
  assert.equal(
    await client.launchApplication({ id: "terminal", name: "Terminal" }),
    "Launch requested: Terminal.",
  );
});

test("browser preview keeps Melly, desktop, and system namespaces separate", () => {
  const originalMelly = globalThis.melly;
  const originalDesktop = globalThis.desktop;
  const originalSystem = globalThis.system;

  try {
    delete globalThis.melly;
    delete globalThis.desktop;
    delete globalThis.system;
    assert.equal(installBrowserPreview(), true);
    assert.equal(globalThis.melly.clientSurfaces, undefined);
    assert.equal(globalThis.desktop.capabilities.has("client-surfaces.focus"), false);
    assert.equal(globalThis.desktop.apps, undefined);
    assert.equal(typeof globalThis.system.apps.list, "function");
    assert.equal(globalThis.system.clientSurfaces, undefined);
  } finally {
    if (originalMelly === undefined) delete globalThis.melly;
    else globalThis.melly = originalMelly;
    if (originalDesktop === undefined) delete globalThis.desktop;
    else globalThis.desktop = originalDesktop;
    if (originalSystem === undefined) delete globalThis.system;
    else globalThis.system = originalSystem;
  }
});
