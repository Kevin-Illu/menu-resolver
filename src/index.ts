import { randomUUID } from "node:crypto";

/**
 * Represents a node in the flattened menu tree.
 */
export type Node<T = any> = {
  id: string;
  data?: T | undefined;
  resolve?: any;
  parentKey: string | null;
  hasChildren: boolean;
}

/**
 * API provided to custom resolve functions for navigation control.
 */
export type ResolverAPI<T = any> = {
  goBack: () => void,
  choose: (nodeId: string) => void,
  currentNode: Node<T> | undefined
}

/**
 * Represents a menu item. Can be a parent node, a simple action, or a custom action.
 */
export type Menu<T = any> = Prettify<MenuParent<T> | MenuActionSimple<T> | MenuActionCustom<T>>;

/**
 * A menu node that contains children but no resolve action.
 */
export type MenuParent<T = any> = {
  data?: T | undefined;
  children: Menu<T>[];
  resolve?: undefined;
};

/**
 * A menu node with a simple string identifier for resolution.
 */
export type MenuActionSimple<T = any> = {
  data?: T | undefined;
  resolve: string;
  children?: Menu<T>[] | undefined;
};

/**
 * A menu node with a custom resolve function.
 */
export type MenuActionCustom<T = any> = {
  data?: T | undefined;
  resolve: (rsApi: ResolverAPI<T>) => any;
  children?: Menu<T>[] | undefined;
};

// just utils
type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};


export type TreeMenuResolverOptions = {
  injectIdKey?: string;
};

/**
 * Manages a tree-based menu structure, providing navigation and resolution capabilities.
 */
export default class TreeMenuResolver<T = any> {
  private flatMapMenu: Map<
    string,
    Node<T>
  > = new Map();

  private currentNodeId: string | null = null;

  /**
   * Initializes the menu resolver with a menu structure.
   * @param menu The array of menu items defining the tree.
   * @param options Configuration options for the resolver.
   */
  constructor(
    private readonly menu: Menu<T>[],
    private readonly options?: TreeMenuResolverOptions
  ) {
    this.buildFlatmap({ menu: this.menu });
  }

  private buildFlatmap({
    menu,
    parentKey = null,
  }: {
    menu: Menu<T>[] | Menu<T>;
    parentKey?: string | null;
  }) {
    if (!Array.isArray(menu)) {
      const key = randomUUID();

      const node: Node<T> = {
        id: key,
        data: this.injectId(menu.data, key),
        parentKey: parentKey || null,
        resolve: undefined,
        hasChildren: !!(Array.isArray(menu.children) && menu.children.length >= 1),
      };

      node.resolve = this.resolveAction(menu?.resolve, key);

      this.flatMapMenu.set(key, node);

      // if has children then double it and pass it to the next person xD
      if (menu?.children && menu.children.length >= 1) {
        this.buildFlatmap({ menu: menu.children, parentKey: key });
        return;
      }

      return;
    }

    for (const option of menu) {
      this.buildFlatmap({ menu: option, parentKey });
    }
  }

  private resolveAction(action: any, nodeId: string) {
    if (typeof action === "function") {
      return () => {
        // We use the specific nodeId validation to ensure we pass the correct node context
        const currentNode = this.findNodeById(nodeId);

        const api: ResolverAPI<T> = {
          goBack: this.goBack.bind(this),
          choose: this.choose.bind(this),
          currentNode,
        };

        return action(api);
      };
    }

    return action;
  }

  /**
   * Retrieves the list of menu items for the current navigation level.
   * @returns An array of objects containing the id and label of each item.
   */
  public getDisplayableMenu(): T[] {
    const parentKey = this.currentNodeId;
    const children: T[] = [];

    for (const [key, value] of this.flatMapMenu.entries()) {
      if (value.parentKey === parentKey) {
        if (value.data) {
          children.push(value.data);
        } else {
          children.push({} as T);
        }
      }
    }
    return children;
  }

  private findNodeById(id: string | null): Node<T> | undefined {
    if (!id) return undefined;
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

    // If the node has children, update the current node ID
    // Otherwise, return the node's resolve action
    if (node.hasChildren) {
      this.currentNodeId = id;
    }

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

  private injectId(data: T | undefined, id: string): T | undefined {
    if (!this.options?.injectIdKey) {
      return data;
    }

    if (!data) {
      return { [this.options.injectIdKey]: id } as unknown as T;
    }

    return {
      ...data,
      [this.options.injectIdKey]: id,
    } as T;
  }
}
