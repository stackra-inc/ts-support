/**
 * View Menu
 */

import { Menu, MenuItem } from "@abdokouta/ts-desktop";

@Menu("view", { label: "View", order: 2 })
export class ViewMenu {
  @MenuItem({ role: "reload" })
  reload() {}

  @MenuItem({ role: "forceReload" })
  forceReload() {}

  @MenuItem({ role: "toggleDevTools" })
  toggleDevTools() {}

  @MenuItem({ type: "separator" })
  sep() {}

  @MenuItem({ role: "resetZoom" })
  resetZoom() {}

  @MenuItem({ role: "zoomIn" })
  zoomIn() {}

  @MenuItem({ role: "zoomOut" })
  zoomOut() {}

  @MenuItem({ type: "separator" })
  sep2() {}

  @MenuItem({ role: "togglefullscreen" })
  toggleFullscreen() {}
}
