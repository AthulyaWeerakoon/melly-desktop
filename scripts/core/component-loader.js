const textCache = new Map();

async function loadText(url) {
  const key = url.href;
  if (!textCache.has(key)) {
    textCache.set(
      key,
      fetch(url).then((response) => {
        if (!response.ok) {
          throw new Error(`Could not load ${url.pathname}: ${response.status}`);
        }
        return response.text();
      }),
    );
  }

  return textCache.get(key);
}

/**
 * Loads a component's adjacent HTML and CSS into its open shadow root.
 * Paths are derived only from the component module URL and never from runtime data.
 */
export async function loadComponent(host, moduleUrl, basename) {
  const componentDirectory = new URL(".", moduleUrl);
  const [markup, stylesheet] = await Promise.all([
    loadText(new URL(`${basename}.html`, componentDirectory)),
    loadText(new URL(`${basename}.css`, componentDirectory)),
  ]);

  const root = host.shadowRoot ?? host.attachShadow({ mode: "open" });
  const parsedMarkup = new DOMParser().parseFromString(markup, "text/html");
  const style = document.createElement("style");
  style.textContent = stylesheet;
  root.replaceChildren(style, ...Array.from(parsedMarkup.body.childNodes));
  return root;
}

export function showComponentError(host, label, error) {
  const root = host.shadowRoot ?? host.attachShadow({ mode: "open" });
  const message = document.createElement("p");
  message.setAttribute("role", "alert");
  message.textContent = `${label} unavailable: ${error instanceof Error ? error.message : String(error)}`;
  root.replaceChildren(message);
}
