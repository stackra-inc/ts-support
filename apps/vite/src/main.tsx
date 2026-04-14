import "reflect-metadata";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { bootstrapApp } from "@abdokouta/ts-application";
import { ContainerProvider } from "@abdokouta/ts-container-react";

import { Provider } from "./provider";
import App from "./App";

import { AppModule } from "@/lib/app.module";
import "@/styles/globals.css";

/**
 * Bootstrap the DI container, then render the React app.
 *
 * bootstrapApp() creates the ApplicationContext, exposes it on
 * window.__APP_CONTEXT__ in dev, and returns it ready for ContainerProvider.
 */
async function bootstrap() {
  const app = await bootstrapApp(AppModule);

  // Add Electron class to body for CSS adjustments (traffic light padding)
  if ((window as any).electronAPI) {
    document.body.classList.add("is-electron");
  }

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <ContainerProvider context={app}>
        <Provider>
          <App />
        </Provider>
      </ContainerProvider>
    </BrowserRouter>,
  );
}

bootstrap().catch(console.error);
