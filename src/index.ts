import { treeMenuTest } from "./test.js";

export type Menu = {
  label: string;
  resolve?: any;
  children?: Menu[];
};

export default class TreeMenuResolver {
  private __mappedTree: Map<
    string,
    Omit<Menu, "children"> & {
      children: string[];
    }
  > = new Map();

  constructor(private readonly menu: Menu[]) {
    this.buildMap(this.menu);
    console.log(this.__mappedTree);
  }

  // don't forget the childrens
  // thoes needs to be references. ONLY ids
  buildMap({ menu, children, index }) {
    if (!Array.isArray(menu)) {
      const id = `${menu.label.replaceAll(" ", "-").toLowerCase()}-${index}`;
      this.__mappedTree.set(id, {
        ...menu,
        children: [],
      });

      if (
        menu.children &&
        Array.isArray(menu.children) &&
        menu.children.length
      ) {
        this.buildMap(menu.children);
        return;
      }
      return;
    }

    for (const option of menu) {
      this.buildMap(option, null, index + 1);
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
