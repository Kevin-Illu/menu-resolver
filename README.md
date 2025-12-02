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

// 1. Define your menu structure
const menuStructure: Menu[] = [
  {
    label: "Start Game",
    resolve: () => console.log("Starting game..."),
  },
  {
    label: "Settings",
    children: [
      {
        label: "Audio",
        resolve: () => console.log("Opening audio settings..."),
      },
      {
        label: "Graphics",
        resolve: () => console.log("Opening graphics settings..."),
      },
    ],
  },
  {
    label: "Exit",
    resolve: () => process.exit(0),
  },
];

// 2. Initialize the resolver
const resolver = new TreeMenuResolver(menuStructure);

// 3. Get the top-level menu items
const mainOptions = resolver.getDisplayableMenu();
console.log(mainOptions.map(o => o.label));
// Output: ['Start Game', 'Settings', 'Exit']

// 4. Navigate to a submenu (e.g., "Settings")
const settingsNode = mainOptions.find(o => o.label === "Settings");
if (settingsNode) {
  const result = resolver.choose(settingsNode.id);
  
  const settingsOptions = resolver.getDisplayableMenu();
  console.log(settingsOptions.map(o => o.label));
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

const menuStructure: Menu[] = [
  {
    label: "User Management",
    children: [
      {
        label: "Create User",
        resolve: (api: ResolverAPI) => {
          console.log("Creating user...");
          // After creating user, go back to main menu
          api.goBack();
        },
      },
      {
        label: "Delete User",
        resolve: (api: ResolverAPI) => {
          console.log("Deleting user...");
          // Navigate back after action
          api.goBack();
        },
      },
      {
        label: "Back to Main Menu",
        resolve: (api: ResolverAPI) => {
          api.goBack();
        },
      },
    ],
  },
  {
    label: "Reports",
    children: [
      {
        label: "Generate Report",
        resolve: (api: ResolverAPI) => {
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
const userMgmt = menu.find(o => o.label === "User Management");
if (userMgmt) {
  resolver.choose(userMgmt.id);
  
  // Choose "Create User"
  const subMenu = resolver.getDisplayableMenu();
  const createUser = subMenu.find(o => o.label === "Create User");
  if (createUser) {
    const result = resolver.choose(createUser.id);
    if (result.resolve) {
      result.resolve(); // This will create user and go back automatically
    }
  }
}
```


## API Reference

### `constructor(menu: Menu[])`
Initializes the menu resolver with a tree of menu items.

**Parameters:**
- `menu`: Array of `Menu` objects defining the menu structure.

---

### `getDisplayableMenu()`
Returns the list of menu items for the current level.

**Returns:** 
```typescript
Array<{ id: string; label: string }>
```

**Example:**
```typescript
const options = resolver.getDisplayableMenu();
// [{ id: "uuid-1", label: "Start Game" }, { id: "uuid-2", label: "Settings" }]
```

---

### `choose(id: string)`
Selects a menu item by its ID and updates the current navigation level.

**Parameters:**
- `id`: The unique identifier of the menu item to select.

**Returns:** 
```typescript
{ id: string; resolve?: (api: ResolverAPI) => void | any }
```

**Behavior:**
- If the item has children, the current level updates to show those children.
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
Node | undefined
```

**Example:**
```typescript
const node = resolver.findNodeById(nodeId);
if (node) {
  console.log(node.label, node.parentKey);
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
const settingsNode = topLevel.find(o => o.label === "Settings");
resolver.choose(settingsNode.id);

// Now at Settings submenu
const settingsOptions = resolver.getDisplayableMenu();
// [{ id: "...", label: "Audio" }, { id: "...", label: "Graphics" }]

// Go back to main menu
resolver.goBack();
const backToMain = resolver.getDisplayableMenu();
// [{ id: "...", label: "Start Game" }, { id: "...", label: "Settings" }, ...]

// Try to go back again from top level
resolver.goBack(); // Throws: "You haven't chosen any node"
```

---

## Types

### `Menu`
Defines the structure of a menu item. It is a union of three types:

#### `MenuParent`
A node that contains children but no resolve action.
```typescript
type MenuParent = {
  label: string;
  children: Menu[];
  resolve?: undefined;
};
```

#### `MenuActionSimple`
A node with a string identifier for resolution.
```typescript
type MenuActionSimple = {
  label: string;
  resolve: string;
  children?: Menu[];
};
```

#### `MenuActionCustom`
A node with a custom resolve function.
```typescript
type MenuActionCustom = {
  label: string;
  resolve: (rsApi: ResolverAPI) => any;
  children?: Menu[];
};
```

### `Node`
Internal representation of a menu item with navigation metadata.

```typescript
type Node = {
  id: string;                                       // Unique identifier (auto-generated UUID)
  label: string;                                    // Display text
  resolve?: () => void | any;                       // Wrapped resolve function
  parentKey: string | null;                         // ID of parent node, or null for top-level
};
```

### `ResolverAPI`
API object passed to resolve functions for navigation control.

```typescript
type ResolverAPI = {
  goBack: () => void;  // Navigate back to the parent menu level
};
```

**Usage in resolve functions:**
```typescript
const menu: Menu = {
  label: "Save and Exit",
  resolve: (api: ResolverAPI) => {
    saveData();
    api.goBack(); // Return to previous menu after saving
  },
};
```

---

## License

MIT

