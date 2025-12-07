# Menu Resolver

![npm version](https://img.shields.io/npm/v/menu-resolver.svg)
![npm downloads](https://img.shields.io/npm/dm/menu-resolver.svg)

A flexible, tree-based menu resolver for building command-line interfaces with hierarchical navigation.

## Features

- **Tree Structure**: Define menus with arbitrary depth.
- **Flat Indexing**: Efficient O(1) lookup for menu nodes.
- **Navigation**: State management for traversing the menu tree with `goBack()` support.
- **Action Resolution**: Attach executable functions or data to menu items.
- **Type-Safe**: Full TypeScript support with exported types.

## Installation

```bash
npm install menu-resolver
```

## Usage

### Basic Example

```typescript
import TreeMenuResolver, { Menu } from "menu-resolver";

// Define a type for your menu data (optional but recommended)
type MenuData = { title: string };

// 1. Define your menu structure
const menuStructure: Menu<MenuData>[] = [
  {
    data: { title: "Start Game" },
    resolve: () => console.log("Starting game..."),
  },
  {
    data: { title: "Settings" },
    children: [
      {
        data: { title: "Audio" },
        resolve: () => console.log("Opening audio settings..."),
      },
      {
        data: { title: "Graphics" },
        resolve: () => console.log("Opening graphics settings..."),
      },
    ],
  },
  {
    data: { title: "Exit" },
    resolve: () => process.exit(0),
  },
];

// 2. Initialize the resolver
const resolver = new TreeMenuResolver(menuStructure);

// 3. Get the top-level menu items
const mainOptions = resolver.getDisplayableMenu();
console.log(mainOptions.map(o => o.data?.title));
// Output: ['Start Game', 'Settings', 'Exit']

// 4. Navigate to a submenu (e.g., "Settings")
const settingsNode = mainOptions.find(o => o.data?.title === "Settings");
if (settingsNode) {
  const result = resolver.choose(settingsNode.id);
  
  const settingsOptions = resolver.getDisplayableMenu();
  console.log(settingsOptions.map(o => o.data?.title));
  // Output: ['Audio', 'Graphics']
  
  // 5. Execute a resolve function if it exists
  if (result.resolve) {
    result.resolve();
  }
}
```

### Advanced Example with ResolverAPI

The `resolve` function receives a `ResolverAPI` object that provides navigation capabilities:

```typescript
import TreeMenuResolver, { Menu, ResolverAPI } from "menu-resolver";

type MenuData = { title: string };

const menuStructure: Menu<MenuData>[] = [
  {
    data: { title: "User Management" },
    children: [
      {
        data: { title: "Create User" },
        resolve: (api: ResolverAPI<MenuData>) => {
          console.log("Creating user...");
          // After creating user, go back to main menu
          api.goBack();
        },
      },
      {
        data: { title: "Delete User" },
        resolve: (api: ResolverAPI<MenuData>) => {
          console.log("Deleting user...");
          // Navigate back after action
          api.goBack();
        },
      },
      {
        data: { title: "Back to Main Menu" },
        resolve: (api: ResolverAPI<MenuData>) => {
          api.goBack();
        },
      },
    ],
  },
  {
    data: { title: "Reports" },
    children: [
      {
        data: { title: "Generate Report" },
        resolve: (api: ResolverAPI<MenuData>) => {
          console.log("Generating report...");
          // Stay in the same menu level
        },
      },
    ],
  },
];

const resolver = new TreeMenuResolver(menuStructure);

// Navigate to User Management
const menu = resolver.getDisplayableMenu();
const userMgmt = menu.find(o => o.data?.title === "User Management");
if (userMgmt) {
  resolver.choose(userMgmt.id);
  
  // Choose "Create User"
  const subMenu = resolver.getDisplayableMenu();
  const createUser = subMenu.find(o => o.data?.title === "Create User");
  if (createUser) {
    const result = resolver.choose(createUser.id);
    if (result.resolve) {
      result.resolve(); // This will create user and go back automatically
    }
  }
}
```


## API Reference

### `constructor(menu: Menu<T>[])`
Initializes the menu resolver with a tree of menu items.

**Parameters:**
- `menu`: Array of `Menu` objects defining the menu structure.

---

### `getDisplayableMenu()`
Returns the list of menu items for the current level.

**Returns:** 
```typescript
Array<{ id: string; data?: T }>
```

**Example:**
```typescript
const options = resolver.getDisplayableMenu();
// [{ id: "uuid-1", data: { title: "Start Game" } }, ...]
```

---

### `choose(id: string)`
Selects a menu item by its ID and updates the current navigation level.

**Parameters:**
- `id`: The unique identifier of the menu item to select.

**Returns:** 
```typescript
{ id: string; resolve?: (api: ResolverAPI<T>) => void | any }
```

**Behavior:**
- If the item has children, the current level updates to show those children.
- If the item is a leaf node (no children), the navigation state remains unchanged.
- Returns an object containing the selected node's `id` and `resolve` function (if defined).

**Throws:** 
- `Error` if the ID is invalid or not found.

**Example:**
```typescript
const result = resolver.choose(nodeId);
if (result.resolve) {
  result.resolve(); // Execute the action
}
```

---

### `findNodeById(id: string)`
Retrieves a complete node directly by its ID.

**Parameters:**
- `id`: The unique identifier of the node.

**Returns:** 
```typescript
Node<T> | undefined
```

**Example:**
```typescript
const node = resolver.findNodeById(nodeId);
if (node) {
  console.log(node.data, node.parentKey);
}
```

---

### `goBack()`
Navigates back to the parent node of the currently selected node.

**Behavior:**
- Updates the current level to show the parent's children (siblings of current node).
- Can navigate all the way back to the top level (main menu).
- When at top level, `currentNodeId` becomes `null`.

**Throws:** 
- `"You haven't chosen any node"` if no node is currently selected (already at top level).
- `"Current node with id {id} not found"` if the current node ID is invalid.

**Example:**
```typescript
const topLevel = resolver.getDisplayableMenu();
const settingsNode = topLevel.find(o => o.data?.title === "Settings");
resolver.choose(settingsNode.id);

// Now at Settings submenu
const settingsOptions = resolver.getDisplayableMenu();

// Go back to main menu
resolver.goBack();
const backToMain = resolver.getDisplayableMenu();

// Try to go back again from top level
resolver.goBack(); // Throws: "You haven't chosen any node"
```

---

## Types

### `Menu<T>`
Defines the structure of a menu item. It is a union of three types:

#### `MenuParent<T>`
A node that contains children but no resolve action.
```typescript
type MenuParent<T> = {
  data?: T;
  children: Menu<T>[];
  resolve?: undefined;
};
```

#### `MenuActionSimple<T>`
A node with a string identifier for resolution.
```typescript
type MenuActionSimple<T> = {
  data?: T;
  resolve: string;
  children?: Menu<T>[];
};
```

#### `MenuActionCustom<T>`
A node with a custom resolve function.
```typescript
type MenuActionCustom<T> = {
  data?: T;
  resolve: (rsApi: ResolverAPI<T>) => any;
  children?: Menu<T>[];
};
```

### `Node<T>`
Internal representation of a menu item with navigation metadata.

```typescript
type Node<T> = {
  id: string;                                       // Unique identifier (auto-generated UUID)
  data?: T;                                         // Custom data
  resolve?: () => void | any;                       // Wrapped resolve function
  parentKey: string | null;                         // ID of parent node, or null for top-level
};
```

### `ResolverAPI<T>`
API object passed to resolve functions for navigation control.

```typescript
type ResolverAPI<T> = {
  goBack: () => void;  // Navigate back to the parent menu level
  choose: (nodeId: string) => void; // Choose a node to navigate there.
  currentNode: Node<T> | undefined; // Node selected
};
```

**Usage in resolve functions:**
```typescript
const menu: Menu<MyData> = {
  data: { title: "Save and Exit" },
  resolve: (api: ResolverAPI<MyData>) => {
    saveData();
    api.goBack(); // Return to previous menu after saving
  },
};
```

---

## License

MIT

