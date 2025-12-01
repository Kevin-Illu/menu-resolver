# Menu Resolver

A flexible, tree-based menu resolver for building command-line interfaces.

## Features

- **Tree Structure**: Define menus with arbitrary depth.
- **Flat Indexing**: Efficient O(1) lookup for menu nodes.
- **Navigation**: State management for traversing the menu tree.
- **Action Resolution**: Attach executable data or functions to menu items.

## Installation

```bash
npm install menu-resolver
```

## Usage

### Basic Example

```typescript
import TreeMenuResolver, { Menu } from "./src/index";

// 1. Define your menu structure
const menuStructure: Menu[] = [
  {
    label: "Start Game",
    resolve: "START_GAME_ACTION",
  },
  {
    label: "Settings",
    children: [
      {
        label: "Audio",
        resolve: "OPEN_AUDIO_SETTINGS",
      },
      {
        label: "Graphics",
        resolve: "OPEN_GRAPHICS_SETTINGS",
      },
    ],
  },
  {
    label: "Exit",
    resolve: "EXIT_ACTION",
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
  resolver.choose(settingsNode.id);
  
  const settingsOptions = resolver.getDisplayableMenu();
  console.log(settingsOptions.map(o => o.label));
  // Output: ['Audio', 'Graphics']
}
```

### API Reference

#### `constructor(menu: Menu[])`
Initializes the menu resolver with a tree of menu items.

#### `getDisplayableMenu()`
Returns the list of menu items for the current level.
- Returns: Array of objects containing `id` and `label` only.

#### `choose(id: string)`
Selects a menu item by its ID.
- If the item has children, the current level updates to show those children.
- Returns: `{ id: string, resolve: any }` containing the selected node's ID and resolve value.
- Throws: Error if the ID is invalid.

#### `findNodeById(id: string)`
Retrieves a node directly by its ID.
- Returns: Node object or `undefined` if not found.

#### `goBack()`
Navigates back to the parent node of the currently selected node.
- Updates the current level to show the parent's siblings.
- Can navigate all the way back to the top level (main menu).
- Throws: `"You haven't chosen any node"` if no node is currently selected (already at top level).
- Throws: `"Current node with id {id} not found"` if the current node ID is invalid.

**Example:**
```typescript
const topLevel = resolver.getDisplayableMenu();
const settingsNode = topLevel.find(o => o.label === "Settings");
resolver.choose(settingsNode.id);

// Now at Settings submenu
const settingsOptions = resolver.getDisplayableMenu();
// ['Audio', 'Graphics']

// Go back to main menu
resolver.goBack();
const backToMain = resolver.getDisplayableMenu();
// ['Start Game', 'Settings', 'Exit']

// Try to go back again from top level
resolver.goBack(); // Throws: "You haven't chosen any node"
```

## Types

```typescript
type Menu = {
  label: string;
  resolve?: any;     // Data or function to execute when selected
  children?: Menu[]; // Nested menu items
};
```
