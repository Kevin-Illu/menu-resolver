
import { describe, it, expect, beforeEach } from "vitest";
import TreeMenuResolver, { Menu, ResolverAPI } from "./index";

type TestData = { label: string; id?: string };

describe("TreeMenuResolver", () => {
  let menu: Menu<TestData>[];
  let resolver: TreeMenuResolver<TestData>;

  beforeEach(() => {
    menu = [
      {
        data: { label: "Node 1" },
        resolve: "Node 1",
        children: [
          {
            data: { label: "Node 1: child 1" },
            resolve: "Node 1: child 1",
          },
          {
            data: { label: "Node 1: child 2" },
            resolve: "Node 1: child 2",
            children: [
              {
                data: { label: "Node 1: child 2: subchild 1" },
                resolve: () => "Node 1: child 2: subchild 1",
                children: [
                  {
                    data: { label: "Node 1: child 2: subchild 1: child 1" },
                    resolve: "Node 1: child 2: subchild 1: child 1",
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        data: { label: "Node 2" },
        resolve: "Node 2",
        children: [],
      },
    ];
    // In the new API, we must verify that we can inject IDs to navigate
    resolver = new TreeMenuResolver(menu, { injectIdKey: 'id' });
  });

  it("should return top-level items initially", () => {
    const displayable = resolver.getDisplayableMenu();
    expect(displayable).toHaveLength(2);
    expect(displayable[0]!.label).toBe("Node 1");
    expect(displayable[1]!.label).toBe("Node 2");
  });

  it("should drill down to children when a node is selected", () => {
    const topLevel = resolver.getDisplayableMenu();
    const node1 = topLevel.find((n) => n.label === "Node 1");
    expect(node1).toBeDefined();

    resolver.choose(node1!.id!);

    const level2 = resolver.getDisplayableMenu();
    expect(level2).toHaveLength(2);
    expect(level2[0]!.label).toBe("Node 1: child 1");
    expect(level2[1]!.label).toBe("Node 1: child 2");
  });

  it("should drill down further to sub-children", () => {
    // Select Node 1
    const topLevel = resolver.getDisplayableMenu();
    const node1 = topLevel.find((n) => n.label === "Node 1");
    resolver.choose(node1!.id!);

    // Select Node 1: child 2
    const level2 = resolver.getDisplayableMenu();
    const child2 = level2.find((n) => n.label === "Node 1: child 2");
    expect(child2).toBeDefined();
    resolver.choose(child2!.id!);

    // Check Level 3
    const level3 = resolver.getDisplayableMenu();
    expect(level3).toHaveLength(1);
    expect(level3[0]!.label).toBe("Node 1: child 2: subchild 1");
  });

  it("should not navigate for leaf nodes", () => {
    // Select Node 2 (leaf)
    const topLevel = resolver.getDisplayableMenu();
    const node2 = topLevel.find((n) => n.label === "Node 2");
    resolver.choose(node2!.id!);

    const level2 = resolver.getDisplayableMenu();
    // Should remain at the top level
    expect(level2).toHaveLength(2);
    expect(level2.find((n) => n.label === "Node 1")).toBeDefined();
    expect(level2.find((n) => n.label === "Node 2")).toBeDefined();
  });

  it("should throw error when choosing invalid id", () => {
    expect(() => resolver.choose("invalid-id")).toThrowError(
      "Node with id invalid-id not found"
    );
  });

  it("should handle empty menu", () => {
    const emptyResolver = new TreeMenuResolver([], { injectIdKey: "id" });
    const displayable = emptyResolver.getDisplayableMenu();
    expect(displayable).toHaveLength(0);
  });

  it("should throw error for circular references", () => {
    const node1: Menu<TestData> = { data: { label: "Node 1" }, children: [] };
    const node2: Menu<TestData> = { data: { label: "Node 2" }, children: [] };
    node1.children = [node2];
    node2.children = [node1]; // Circular reference

    expect(() => new TreeMenuResolver([node1], { injectIdKey: "id" })).toThrowError(/Maximum call stack size exceeded|Circular reference detected/);
  });

  describe("goBack()", () => {
    it("should navigate back to parent node", () => {
      // Navigate to Node 1
      const topLevel = resolver.getDisplayableMenu();
      const node1 = topLevel.find((n) => n.label === "Node 1");
      resolver.choose(node1!.id!);

      // Navigate to Node 1: child 2
      const level2 = resolver.getDisplayableMenu();
      const child2 = level2.find((n) => n.label === "Node 1: child 2");
      resolver.choose(child2!.id!);

      // Verify we're at level 3
      const level3 = resolver.getDisplayableMenu();
      expect(level3).toHaveLength(1);
      expect(level3[0]!.label).toBe("Node 1: child 2: subchild 1");

      // Go back to level 2
      resolver.goBack();
      const backToLevel2 = resolver.getDisplayableMenu();
      expect(backToLevel2).toHaveLength(2);
      expect(backToLevel2[0]!.label).toBe("Node 1: child 1");
      expect(backToLevel2[1]!.label).toBe("Node 1: child 2");
    });

    it("should navigate back multiple levels", () => {
      // Navigate to Node 1
      const topLevel = resolver.getDisplayableMenu();
      const node1 = topLevel.find((n) => n.label === "Node 1");
      resolver.choose(node1!.id!);

      // Navigate to Node 1: child 2
      const level2 = resolver.getDisplayableMenu();
      const child2 = level2.find((n) => n.label === "Node 1: child 2");
      resolver.choose(child2!.id!);

      // Navigate to Node 1: child 2: subchild 1
      const level3 = resolver.getDisplayableMenu();
      const subchild1 = level3.find((n) => n.label === "Node 1: child 2: subchild 1");
      resolver.choose(subchild1!.id!);

      // Go back to level 3 (Node 1: child 2's children)
      resolver.goBack();
      const backToLevel3 = resolver.getDisplayableMenu();
      expect(backToLevel3).toHaveLength(1);
      expect(backToLevel3[0]!.label).toBe("Node 1: child 2: subchild 1");

      // Go back to level 2 (Node 1's children)
      resolver.goBack();
      const backToLevel2 = resolver.getDisplayableMenu();
      expect(backToLevel2).toHaveLength(2);
      expect(backToLevel2[0]!.label).toBe("Node 1: child 1");
      expect(backToLevel2[1]!.label).toBe("Node 1: child 2");
    });

    it("should throw error when no node has been chosen", () => {
      expect(() => resolver.goBack()).toThrowError(
        "You haven't chosen any node"
      );
    });

    it("should allow going back to the top level from a first-level node", () => {
      const topLevel = resolver.getDisplayableMenu();
      const node1 = topLevel.find((n) => n.label === "Node 1");
      resolver.choose(node1!.id!);

      // Verify we're at Node 1's children
      const level2 = resolver.getDisplayableMenu();
      expect(level2).toHaveLength(2);

      // Go back to top level (currentNodeId becomes null)
      resolver.goBack();
      const backToTop = resolver.getDisplayableMenu();
      expect(backToTop).toHaveLength(2);
      expect(backToTop[0]!.label).toBe("Node 1");
      expect(backToTop[1]!.label).toBe("Node 2");

      // Try to go back again from top level - should throw error
      expect(() => resolver.goBack()).toThrowError(
        "You haven't chosen any node"
      );
    });
  });

  describe("ResolverAPI", () => {
    it("should provide the correct currentNode in resolve callback", () => {
      let capturedNode: any;
      const customMenu: Menu<TestData>[] = [{
        data: { label: "My Node" },
        resolve: (api: ResolverAPI<TestData>) => {
          capturedNode = api.currentNode;
        }
      }];
      // Inject ID so we can select it
      const customResolver = new TreeMenuResolver(customMenu, { injectIdKey: 'id' });
      const displayable = customResolver.getDisplayableMenu();
      const myNode = displayable.find(n => n.label === "My Node");

      expect(myNode).toBeDefined();

      const result = customResolver.choose(myNode!.id!);

      // Execute the resolve function
      if (typeof result.resolve === 'function') {
        result.resolve();
      }

      expect(capturedNode).toBeDefined();
      expect(capturedNode.id).toBe(myNode!.id!);
      expect(capturedNode.data.label).toBe("My Node");
    });
  });

  describe("Generic Data Support", () => {
    it("should support attaching and retrieving custom data", () => {
      type CustomData = { role: string; accessLevel: number; id?: string };
      const menuWithData: Menu<CustomData>[] = [
        {
          data: { role: "admin", accessLevel: 10 },
          children: [
            {
              data: { role: "admin", accessLevel: 5 },
              resolve: "manage_users"
            }
          ]
        }
      ];

      const resolver = new TreeMenuResolver(menuWithData, { injectIdKey: 'id' });
      const topLevel = resolver.getDisplayableMenu();

      expect(topLevel[0]!).toEqual({ role: "admin", accessLevel: 10, id: expect.any(String) });

      resolver.choose(topLevel[0]!.id!);
      const subMenu = resolver.getDisplayableMenu();

      expect(subMenu[0]!).toEqual({ role: "admin", accessLevel: 5, id: expect.any(String) });
    });
  });

  describe("Options", () => {
    it("should inject generated id into data object when injectIdKey option is provided", () => {
      type TestData = { label: string; myId?: string };

      const menu: Menu<TestData>[] = [
        {
          data: { label: "Item 1" },
          resolve: "action1",
        },
        {
          data: { label: "Item 2" },
          resolve: "action2",
          children: [
            {
              data: { label: "Item 2 Child" },
              resolve: "action2-child",
            }
          ]
        }
      ];

      const resolver = new TreeMenuResolver(menu, { injectIdKey: "myId" });
      const displayable = resolver.getDisplayableMenu();

      // Check Item 1
      const item1 = displayable.find(i => i.label === "Item 1");
      expect(item1).toBeDefined();
      expect(item1?.myId).toBeDefined();
      expect(typeof item1?.myId).toBe("string");

      // Check Item 2
      const item2 = displayable.find(i => i.label === "Item 2");
      expect(item2).toBeDefined();
      expect(item2?.myId).toBeDefined();

      // Check Drill down
      resolver.choose(item2!.myId!);
      const subMenu = resolver.getDisplayableMenu();
      const child = subMenu.find(i => i.label === "Item 2 Child");
      expect(child).toBeDefined();
      expect(child?.myId).toBeDefined();
    });

    it("should inject id even if data is initially undefined", () => {
      type TestData = { myId?: string };
      const menu: Menu<TestData>[] = [
        {
          resolve: "action1"
        }
      ];

      const resolver = new TreeMenuResolver(menu, { injectIdKey: "myId" });
      const displayable = resolver.getDisplayableMenu();

      expect(displayable[0]).toBeDefined();
      expect(displayable[0]?.myId).toBeDefined();
      expect(typeof displayable[0]?.myId).toBe("string");
    });

    it("should not inject id if option is not provided", () => {
      type TestData = { label: string; myId?: string };
      const menu: Menu<TestData>[] = [
        {
          data: { label: "Item 1" },
          resolve: "action1",
        }
      ];

      const resolver = new TreeMenuResolver(menu, { injectIdKey: "id" });
      const displayable = resolver.getDisplayableMenu();

      expect(displayable[0]?.myId).toBeUndefined();
    });
  });
});

