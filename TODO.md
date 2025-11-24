# Project Tasks

## Core Functionality
- [x] **Define Tree Menu Structure**: Support defining the menu as a tree or list of options.
- [x] **TreeMenuResolver Class**: Implement the main class to manage the menu state.
- [x] **Menu Flattening**: Implement `buildFlatmap` to index all menu nodes for O(1) access.
- [x] **Displayable Menu**: Implement `getDisplayableMenu` to retrieve the current menu state, supporting depth limiting.
- [x] **Navigation**: Implement `choose` method to update the current node and navigate the tree.
- [x] **Action Resolution**: Ensure menu options can have executable `resolve` functions.

## Usage Pattern
- [x] **Loop Support**: Ensure the manager state can be used in an external user-controlled loop.

## Future / Pending
- [x] Add unit tests for edge cases (circular references, empty menus).
