/**
 * Edit Menu
 */

import { Menu, MenuItem } from "@abdokouta/ts-desktop";

@Menu("edit", { label: "Edit", order: 1 })
export class EditMenu {
  @MenuItem({ role: "undo" })
  undo() {}

  @MenuItem({ role: "redo" })
  redo() {}

  @MenuItem({ type: "separator" })
  sep() {}

  @MenuItem({ role: "cut" })
  cut() {}

  @MenuItem({ role: "copy" })
  copy() {}

  @MenuItem({ role: "paste" })
  paste() {}

  @MenuItem({ role: "selectAll" })
  selectAll() {}
}
