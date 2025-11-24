import { randomUUID } from "node:crypto";
import { treeMenuTest } from "./test.js";

export type Menu = {
  label: string;
  resolve?: any;
  children?: Menu[];
};

export default class TreeMenuResolver {
  private flatMapMenu: Map<
    string,
    Omit<Menu, "children"> & {
      parentKey: string | null;
    }
  > = new Map();

  constructor(private readonly menu: Menu[]) {
    this.buildFlatmap({ menu: this.menu });
    console.log(this.flatMapMenu);
    // console.log(this.__mappedTree);
  }

  // don't forget the children
  // thoes needs to be references. ONLY ids
  buildFlatmap({
    menu,
    parentKey = null,
  }: {
    menu: Menu[] | Menu;
    parentKey?: string | null;
  }) {
    if (!Array.isArray(menu)) {
      const key = randomUUID();

      this.flatMapMenu.set(key, {
        label: menu.label,
        parentKey: parentKey || null,
        resolve: menu?.resolve ?? null,
      });

      // if has children then double it and pass it to the next person xD
      if (menu?.children && menu.children.length >= 1) {
        this.buildFlatmap({ menu: menu.children, parentKey: key });
        return;
      }

      return;
    }

    for (const option of menu as Menu[]) {
      this.buildFlatmap({ menu: option, parentKey });
    }
  }
}
//
const menuManager = new TreeMenuResolver(treeMenuTest);
// const displayableMenu = menuManager.getDisplayableMenu();
// console.log(displayableMenu);
// const optionSelected = displayableMenu?.children[1];
//
// console.log(optionSelected);
// // console.log(menuManager.findNodeById(optionSelected.id));
