const initialState = Object.freeze({
  desktops: [
    { id: "desktop-1", name: "Main" },
    { id: "desktop-2", name: "Focus" },
  ],
  activeDesktopId: "desktop-1",
  focusedWindowId: null,
  windows: [],
  preferences: {
    accent: "cyan",
    compactWindows: false,
    reducedMotion: false,
  },
});

const allowedAccents = new Set(["cyan", "violet", "coral"]);

function copy(value) {
  return structuredClone(value);
}

export class DesktopStore {
  #state;
  #subscribers = new Set();
  #nextDesktopNumber = 3;
  #nextWindowNumber = 1;
  #nextZIndex = 1;

  constructor(state = initialState) {
    this.#state = copy(state);
  }

  getSnapshot() {
    return copy(this.#state);
  }

  subscribe(subscriber) {
    this.#subscribers.add(subscriber);
    subscriber(this.getSnapshot());
    return () => this.#subscribers.delete(subscriber);
  }

  activateDesktop(desktopId) {
    if (!this.#state.desktops.some(({ id }) => id === desktopId)) {
      return false;
    }

    this.#update((state) => {
      state.activeDesktopId = desktopId;
      state.focusedWindowId = this.#topWindowId(state, desktopId);
    });
    return true;
  }

  addDesktop() {
    const number = this.#nextDesktopNumber++;
    const desktop = { id: `desktop-${number}`, name: `Desktop ${number}` };
    this.#update((state) => {
      state.desktops.push(desktop);
      state.activeDesktopId = desktop.id;
      state.focusedWindowId = null;
    });
    return copy(desktop);
  }

  openTool(tool) {
    const desktopId = this.#state.activeDesktopId;
    const existing = tool.multiple
      ? null
      : this.#state.windows.find(
          (windowRecord) =>
            windowRecord.desktopId === desktopId && windowRecord.toolId === tool.id,
        );

    if (existing) {
      this.focusWindow(existing.id);
      return existing.id;
    }

    const id = `window-${this.#nextWindowNumber++}`;
    const offset = (this.#state.windows.filter((item) => item.desktopId === desktopId).length % 5) * 28;
    const windowRecord = {
      id,
      kind: "tool",
      toolId: tool.id,
      title: tool.title,
      icon: tool.icon,
      desktopId,
      mode: "floating",
      zIndex: this.#nextZIndex++,
      bounds: {
        x: 72 + offset,
        y: 58 + offset,
        width: tool.preferredSize.width,
        height: tool.preferredSize.height,
      },
    };

    this.#update((state) => {
      state.windows.push(windowRecord);
      state.focusedWindowId = id;
    });
    return id;
  }

  closeWindow(windowId) {
    this.#update((state) => {
      const originalLength = state.windows.length;
      state.windows = state.windows.filter(({ id }) => id !== windowId);
      if (state.windows.length === originalLength) {
        return;
      }
      if (state.focusedWindowId === windowId) {
        state.focusedWindowId = this.#topWindowId(state, state.activeDesktopId);
      }
    });
  }

  focusWindow(windowId) {
    const target = this.#state.windows.find(({ id }) => id === windowId);
    if (!target || target.desktopId !== this.#state.activeDesktopId) {
      return;
    }

    this.#update((state) => {
      const windowRecord = state.windows.find(({ id }) => id === windowId);
      windowRecord.zIndex = this.#nextZIndex++;
      state.focusedWindowId = windowId;
    });
  }

  moveWindow(windowId, position) {
    this.#update((state) => {
      const windowRecord = state.windows.find(({ id }) => id === windowId);
      if (!windowRecord || windowRecord.mode !== "floating") {
        return;
      }
      windowRecord.bounds.x = Math.max(8, Math.round(position.x));
      windowRecord.bounds.y = Math.max(8, Math.round(position.y));
    });
  }

  toggleWindowMaximize(windowId) {
    this.#update((state) => {
      const windowRecord = state.windows.find(({ id }) => id === windowId);
      if (!windowRecord) {
        return;
      }
      windowRecord.mode = windowRecord.mode === "maximized" ? "floating" : "maximized";
      windowRecord.zIndex = this.#nextZIndex++;
      state.focusedWindowId = windowId;
    });
  }

  updatePreference(key, value) {
    if (key === "accent" && allowedAccents.has(value)) {
      this.#update((state) => {
        state.preferences.accent = value;
      });
      return true;
    }

    if (["compactWindows", "reducedMotion"].includes(key) && typeof value === "boolean") {
      this.#update((state) => {
        state.preferences[key] = value;
      });
      return true;
    }

    return false;
  }

  #topWindowId(state, desktopId) {
    return (
      state.windows
        .filter((windowRecord) => windowRecord.desktopId === desktopId)
        .sort((left, right) => right.zIndex - left.zIndex)[0]?.id ?? null
    );
  }

  #update(mutator) {
    const nextState = copy(this.#state);
    mutator(nextState);
    this.#state = nextState;
    const snapshot = this.getSnapshot();
    this.#subscribers.forEach((subscriber) => subscriber(snapshot));
  }
}

export function createDesktopStore(state) {
  return new DesktopStore(state);
}

export const desktopStore = createDesktopStore();
