import { describe, it, expect, beforeEach } from "vitest";
import TreeMenuResolver, { Menu } from "./index";

describe("TreeMenuResolver", () => {
  let menu: Menu[];
  let resolver: TreeMenuResolver;

  beforeEach(() => {
    menu = [
      {
        label: "Node 1",
        resolve: () => "Node 1",
        children: [
          {
            label: "Node 1: child 1",
            resolve: () => "Node 1: child 1",
            children: [],
          },
          {
            label: "Node 1: child 2",
            resolve: () => "Node 1: child 2",
            children: [
              {
                label: "Node 1: child 2: subchild 1",
                resolve: () => "Node 1: child 2: subchild 1",
                children: [],
              },
            ],
          },
        ],
      },
      {
        label: "Node 2",
        resolve: () => "Node 2",
        children: [],
      },
    ];
    resolver = new TreeMenuResolver(menu);
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

    resolver.choose(node1!.id);

    const level2 = resolver.getDisplayableMenu();
    expect(level2).toHaveLength(2);
    expect(level2[0]!.label).toBe("Node 1: child 1");
    expect(level2[1]!.label).toBe("Node 1: child 2");
  });

  it("should drill down further to sub-children", () => {
    // Select Node 1
    const topLevel = resolver.getDisplayableMenu();
    const node1 = topLevel.find((n) => n.label === "Node 1");
    resolver.choose(node1!.id);

    // Select Node 1: child 2
    const level2 = resolver.getDisplayableMenu();
    const child2 = level2.find((n) => n.label === "Node 1: child 2");
    expect(child2).toBeDefined();
    resolver.choose(child2!.id);

    // Check Level 3
    const level3 = resolver.getDisplayableMenu();
    expect(level3).toHaveLength(1);
    expect(level3[0]!.label).toBe("Node 1: child 2: subchild 1");
  });

  it("should return empty array for leaf nodes", () => {
    // Select Node 2 (leaf)
    const topLevel = resolver.getDisplayableMenu();
    const node2 = topLevel.find((n) => n.label === "Node 2");
    resolver.choose(node2!.id);

    const level2 = resolver.getDisplayableMenu();
    expect(level2).toHaveLength(0);
  });

  it("should throw error when choosing invalid id", () => {
    expect(() => resolver.choose("invalid-id")).toThrowError(
      "Node with id invalid-id not found"
    );
  });

  it("should handle empty menu", () => {
    const emptyResolver = new TreeMenuResolver([]);
    const displayable = emptyResolver.getDisplayableMenu();
    expect(displayable).toHaveLength(0);
  });

  it("should throw error for circular references", () => {
    const node1: Menu = { label: "Node 1", children: [] };
    const node2: Menu = { label: "Node 2", children: [] };
    node1.children = [node2];
    node2.children = [node1]; // Circular reference

    expect(() => new TreeMenuResolver([node1])).toThrowError(/Maximum call stack size exceeded|Circular reference detected/);
  });
});
