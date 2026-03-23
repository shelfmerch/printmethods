import createApp from "@shopify/app-bridge";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./fonts.css";

const params = new URLSearchParams(window.location.search);
const host = params.get("host");

// Initialize Shopify App Bridge so the app can communicate with the Shopify admin iframe.
// `host` should be provided by the OAuth callback redirect.
if (host) {
  const app = createApp({
    apiKey: import.meta.env.VITE_SHOPIFY_API_KEY as string,
    host: host,
    forceRedirect: true,
  });
  void app;
}

createRoot(document.getElementById("root")!).render(<App />);
