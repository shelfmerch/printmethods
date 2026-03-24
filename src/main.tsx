// import createApp from "@shopify/app-bridge";
// import { createRoot } from "react-dom/client";
// import App from "./App.tsx";
// import "./index.css";
// import "./fonts.css";

// const params = new URLSearchParams(window.location.search);
// const host = params.get("host");

// // Initialize Shopify App Bridge so the app can communicate with the Shopify admin iframe.
// // `host` should be provided by the OAuth callback redirect.
// if (host) {
//   const apiKey = import.meta.env.VITE_SHOPIFY_API_KEY;
//   if (apiKey) {
//     const app = createApp({
//       apiKey,
//       host,
//       forceRedirect: true,
//     });
//     // Keep a reference so initialization happens immediately.
//     void app;
//   }
// }

// createRoot(document.getElementById("root")!).render(<App />);

import createApp from "@shopify/app-bridge";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./fonts.css";

const params = new URLSearchParams(window.location.search);
const shop = params.get("shop");
const host = params.get("host") || (shop ? btoa(`${shop}/admin`) : null);

// Initialize Shopify App Bridge so the app can communicate with the Shopify admin iframe.
// `host` should be provided by the OAuth callback redirect.
if (host) {
  const apiKey = import.meta.env.VITE_SHOPIFY_API_KEY;
  if (apiKey) {
    console.log("[AppBridge] Initializing", { shop, host });
    const app = createApp({
      apiKey,
      host,
      forceRedirect: true,
    });
    // Keep a reference so initialization happens immediately.
    void app;
  }
}

createRoot(document.getElementById("root")!).render(<App />);