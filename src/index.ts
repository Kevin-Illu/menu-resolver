import { randomUUID } from "node:crypto";

export type Menu = {
  label: string;
  resolve?: any;
  children?: Menu[];
};

export default class TreeMenuResolver {
  private flatMapMenu: Map<
    string,
    Omit<Menu, "children"> & {
      id: string;
      parentKey: string | null;
    }
  > = new Map();

  private currentNodeId: string | null = null;

  constructor(private readonly menu: Menu[]) {
    this.buildFlatmap({ menu: this.menu });
  }

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
        id: key,
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

  getDisplayableMenu(): {
    id: string;
    label: string;
    parentKey: string | null;
    resolve?: any;
    children?: any[];
  }[] {
    const parentKey = this.currentNodeId;
    const children: any[] = [];

    for (const [key, value] of this.flatMapMenu.entries()) {
      if (value.parentKey === parentKey) {
        children.push({
          ...value
        });
      }
    }
    return children;
  }

  findNodeById(id: string) {
    return this.flatMapMenu.get(id);
  }

  choose(id: string) {
    const node = this.flatMapMenu.get(id);
    if (!node) {
      throw new Error(`Node with id ${id} not found`);
    }

    this.currentNodeId = id;
    return {
      id: node.id,
      resolve: node.resolve,
    };
  }
}

