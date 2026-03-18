import createApp, { type ClientApplication } from '@shopify/app-bridge';
import { Redirect } from '@shopify/app-bridge/actions';

type AppBridgeInit = {
  apiKey: string;
  host: string;
};

const appCache = new Map<string, ClientApplication>();

export function getAppBridgeApp({ apiKey, host }: AppBridgeInit): ClientApplication {
  const key = `${apiKey}::${host}`;
  const existing = appCache.get(key);
  if (existing) return existing;

  const app = createApp({ apiKey, host });
  appCache.set(key, app);
  return app;
}

export function appBridgeRedirectToApp(app: ClientApplication, path: string) {
  Redirect.create(app).dispatch(Redirect.Action.APP, path);
}

