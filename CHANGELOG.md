# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [3.1.0] - 2025-12-14

### Added
- **New Feature**: `injectIdKey` option in `TreeMenuResolverOptions`.
  - Allows automatic injection of the generated node ID into the `data` object.
  - Useful for tracking IDs directly within your data structure without manual mapping.

### Changed
- **BREAKING**: `TreeMenuResolver` constructor now **requires** a second argument `options`.
  - Pass `{ injectIdKey: 'your_id_field' }` provides the ID of the node into the data object key that you choose.
- **BREAKING**: `getDisplayableMenu()` now returns a flattened array of type `T[]`.
  - Previously returned `{ id: string, data?: T }[]`.
  - The `id` is now expected to be part of `T` (via `injectIdKey`) if needed.

## [3.0.1] - 2025-12-06

### Fixed
- Fixed navigation behavior: `choose()` no longer navigates into nodes that have no children (leaf nodes), preventing empty menu states.

## [3.0.0] - 2025-12-05

### Changed
- **BREAKING**: Removed `label` property from `Node`, `MenuParent`, `MenuActionSimple`, and `MenuActionCustom`.
  - Use the new generic `data` property to store labels and other custom information.
  - Example: `{ label: "My Node" }` -> `{ data: { label: "My Node" } }`.
- **BREAKING**: `ResolverAPI` updated:
  - Added `currentNode` property (can be `undefined`).
  - Added `choose` method.
- **Added**: Full Generic support `<T>` for `TreeMenuResolver` and all exported types.
  - Allows strict typing of the `data` property.
  - Defaults to `any` for backward compatibility (except for the `label` removal).
- **Added**: `data` property to all menu node types to support arbitrary metadata.

## [2.0.0] - 2025-12-02

### Changed
- **BREAKING**: Updated `Menu` type to be a union of `MenuParent`, `MenuActionSimple`, and `MenuActionCustom`.
  - `MenuParent`: Node with children, no resolve.
  - `MenuActionSimple`: Node with string resolve.
  - `MenuActionCustom`: Node with function resolve.
- Updated `Node` type to have `resolve` as a parameter-less function (wrapped).

- **BREAKING**: Simplified `Node` type to include `label` and `resolve` properties directly
  - Previously: `Node` only had `id` and `parentKey`
  - Now: `Node` includes `id`, `label`, `resolve`, and `parentKey`
  - This makes the `Node` type more complete and self-contained

- **BREAKING**: Simplified `ResolverAPI` interface
  - Removed `node` property from `ResolverAPI`
  - Now only contains `goBack()` method
  - This simplifies the API and focuses on navigation control

- Updated `flatMapMenu` internal structure
  - Now uses the simplified `Node` type directly
  - Removed complex inline type definition: `Omit<Menu, "children"> & { id: string; parentKey: string | null; }`

### Improved
- Added JSDoc comments to all exported types and methods for better IDE support and documentation.
- Refactored `buildFlatmap` method for better readability
  - Extracted node creation to a separate variable before adding to Map
  - Makes the code flow more explicit and easier to debug

- Enhanced documentation
  - Updated README with comprehensive examples
  - Added `ResolverAPI` usage examples showing `goBack()` functionality
  - Improved type documentation with inline comments
  - Added practical examples demonstrating real-world usage patterns

- Added `example.ts` file
  - Comprehensive demonstration of all library features
  - Shows hierarchical menu navigation
  - Demonstrates `goBack()` functionality
  - Includes practical use cases (File Operations, Settings, etc.)

### Fixed
- Fixed TypeScript type error with `Map.get()` returning `undefined`
  - Added nullish coalescing operator (`?? null`) to convert `undefined` to `null`
  - Ensures type compatibility with `Node | null` expectations

## [1.0.0] - Previous Release

### Added
- Initial release of menu-resolver
- Tree-based menu structure support
- Flat indexing with O(1) lookup
- Navigation state management
- `goBack()` method for hierarchical navigation
- Action resolution system
- Full TypeScript support
