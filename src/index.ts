import { randomUUID } from "node:crypto";
import { Menu, Node, ResolverAPI } from "./types";

export default class TreeMenuResolver {
  private flatMapMenu: Map<
    string,
    Node
  > = new Map();

  private currentNodeId: string | null = null;

  constructor(private readonly menu: Menu[]) {
    this.buildFlatmap({ menu: this.menu });
  }

  private buildFlatmap({
    menu,
    parentKey = null,
  }: {
    menu: Menu[] | Menu;
    parentKey?: string | null;
  }) {
    if (!Array.isArray(menu)) {
      const key = randomUUID();

      const node = {
        id: key,
        label: menu.label,
        parentKey: parentKey || null,
        resolve: this.resolveAction(menu?.resolve),
      };

      this.flatMapMenu.set(key, node);

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

  private resolveAction(action: any) {
    if (typeof action === "function") {
      const api: ResolverAPI = {
        goBack: this.goBack.bind(this)
      };

      return () => action(api);
    }

    return action;
  }

  public getDisplayableMenu(): {
    id: string;
    label: string;
  }[] {
    const parentKey = this.currentNodeId;
    const children: any[] = [];

    for (const [key, value] of this.flatMapMenu.entries()) {
      if (value.parentKey === parentKey) {
        children.push({
          id: value.id,
          label: value.label
        });
      }
    }
    return children;
  }

  private findNodeById(id: string) {
    return this.flatMapMenu.get(id);
  }

  public choose(id: string) {
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

  public goBack() {
    if (!this.currentNodeId) {
      throw new Error("You haven't chosen any node");
    }

    const node = this.findNodeById(this.currentNodeId);

    if (!node) {
      throw new Error(`Current node with id ${this.currentNodeId} not found`);
    }

    this.currentNodeId = node.parentKey;
  }
}
