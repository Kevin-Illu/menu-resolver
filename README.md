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
- Returns: Array of objects containing `id`, `label`, `parentKey`, `resolve`.

#### `choose(id: string)`
Selects a menu item by its ID.
- If the item has children, the current level updates to show those children.
- Returns: `{ id: string, resolve: any }` containing the selected node's ID and resolve value.
- Throws: Error if the ID is invalid.

#### `findNodeById(id: string)`
Retrieves a node directly by its ID.

## Types

```typescript
type Menu = {
  label: string;
  resolve?: any;     // Data or function to execute when selected
  children?: Menu[]; // Nested menu items
};
```
