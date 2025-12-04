import { randomUUID } from "node:crypto";

/**
 * Represents a node in the flattened menu tree.
 */
export type Node = {
  id: string;
  label: string;
  resolve?: () => void | any;
  parentKey: string | null;
}

/**
 * API provided to custom resolve functions for navigation control.
 */
export type ResolverAPI = {
  goBack: () => void,
  choose: (nodeId: string) => void,
  currentNode: Node
}

/**
 * Represents a menu item. Can be a parent node, a simple action, or a custom action.
 */
export type Menu = Prettify<MenuParent | MenuActionSimple | MenuActionCustom>;

/**
 * A menu node that contains children but no resolve action.
 */
export type MenuParent = {
  label: string;
  children: Menu[];
  resolve?: undefined;
};

/**
 * A menu node with a simple string identifier for resolution.
 */
export type MenuActionSimple = {
  label: string;
  resolve: string;
  children?: Menu[] | undefined;
};

/**
 * A menu node with a custom resolve function.
 */
export type MenuActionCustom = {
  label: string;
  resolve: (rsApi: ResolverAPI) => any;
  children?: Menu[] | undefined;
};

// just utils
type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};


/**
 * Manages a tree-based menu structure, providing navigation and resolution capabilities.
 */
export default class TreeMenuResolver {
  private flatMapMenu: Map<
    string,
    Node
  > = new Map();

  private currentNodeId: string | null = null;

  /**
   * Initializes the menu resolver with a menu structure.
   * @param menu The array of menu items defining the tree.
   */
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
      const currentNode = this.findNodeById(this.currentNodeId);

      const api: ResolverAPI = {
        goBack: this.goBack.bind(this),
        choose: this.choose.bind(this),
        currentNode,
      };

      return () => action(api);
    }

    return action;
  }

  /**
   * Retrieves the list of menu items for the current navigation level.
   * @returns An array of objects containing the id and label of each item.
   */
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

  /**
   * Selects a menu item by its ID.
   * Updates the current navigation state to the selected node.
   * @param id The unique identifier of the menu item.
   * @returns An object containing the selected node's id and resolve action (if any).
   * @throws Error if the node with the given id is not found.
   */
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

  /**
   * Navigates back to the parent of the currently selected node.
   * @throws Error if no node is currently selected (already at the root).
   * @throws Error if the current node cannot be found in the internal map.
   */
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
