import assert from "node:assert/strict";
import test from "node:test";

import { builtInTools } from "../scripts/catalog/tools.js";
import { createDesktopStore } from "../scripts/state/desktop-store.js";

test("opens one instance of a singleton tool per desktop", () => {
  const store = createDesktopStore();
  const firstId = store.openTool(builtInTools[0]);
  const repeatedId = store.openTool(builtInTools[0]);

  assert.equal(firstId, repeatedId);
  assert.equal(store.getSnapshot().windows.length, 1);

  store.activateDesktop("desktop-2");
  const secondDesktopId = store.openTool(builtInTools[0]);
  assert.notEqual(secondDesktopId, firstId);
  assert.equal(store.getSnapshot().windows.length, 2);
});

test("keeps windows assigned to their desktop tab", () => {
  const store = createDesktopStore();
  const windowId = store.openTool(builtInTools[1]);
  const addedDesktop = store.addDesktop();

  assert.equal(store.getSnapshot().activeDesktopId, addedDesktop.id);
  assert.equal(store.getSnapshot().focusedWindowId, null);

  store.activateDesktop("desktop-1");
  assert.equal(store.getSnapshot().focusedWindowId, windowId);
});

test("supports focus, movement, maximize, and close actions", () => {
  const store = createDesktopStore();
  const windowId = store.openTool(builtInTools[0]);

  store.moveWindow(windowId, { x: -20, y: 120 });
  let windowRecord = store.getSnapshot().windows[0];
  assert.deepEqual(
    { x: windowRecord.bounds.x, y: windowRecord.bounds.y },
    { x: 8, y: 120 },
  );

  store.toggleWindowMaximize(windowId);
  windowRecord = store.getSnapshot().windows[0];
  assert.equal(windowRecord.mode, "maximized");

  store.closeWindow(windowId);
  assert.equal(store.getSnapshot().windows.length, 0);
  assert.equal(store.getSnapshot().focusedWindowId, null);
});

test("accepts only known preference values", () => {
  const store = createDesktopStore();

  assert.equal(store.updatePreference("accent", "violet"), true);
  assert.equal(store.updatePreference("accent", "remote-theme"), false);
  assert.equal(store.updatePreference("compactWindows", true), true);
  assert.equal(store.updatePreference("unknown", true), false);

  assert.deepEqual(store.getSnapshot().preferences, {
    accent: "violet",
    compactWindows: true,
    reducedMotion: false,
  });
});
