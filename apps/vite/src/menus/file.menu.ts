/**
 * File Menu
 *
 * Defines the File menu items for the desktop app.
 * Auto-registered via DesktopModule.forFeature([FileMenu]).
 */

import { Menu, MenuItem } from "@abdokouta/ts-desktop";

@Menu("file", { label: "File", order: 0 })
export class FileMenu {
  @MenuItem({ label: "New Order", accelerator: "CmdOrCtrl+N" })
  newOrder() {
    console.log("[FileMenu] New Order");
  }

  @MenuItem({ label: "Print Receipt", accelerator: "CmdOrCtrl+P" })
  printReceipt() {
    console.log("[FileMenu] Print Receipt");
  }

  @MenuItem({ type: "separator" })
  sep1() {}

  @MenuItem({ label: "Export Data", accelerator: "CmdOrCtrl+E" })
  exportData() {
    console.log("[FileMenu] Export Data");
  }

  @MenuItem({ type: "separator" })
  sep2() {}

  @MenuItem({ role: "quit" })
  quit() {}
}
