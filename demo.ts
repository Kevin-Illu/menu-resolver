import TreeMenuResolver, { Menu } from "./src/index.js";

const menu: Menu[] = [
  {
    label: "Settings",
    children: [
      { label: "Audio", resolve: "AUDIO_SETTINGS" },
      { label: "Graphics", resolve: "GRAPHICS_SETTINGS" },
    ],
  },
  {
    label: "Exit",
    resolve: "EXIT",
  },
];

const resolver = new TreeMenuResolver(menu);

console.log("=== Top Level ===");
let current = resolver.getDisplayableMenu();
console.log(current.map((n) => n.label));
// Output: ['Settings', 'Exit']

console.log("\n=== Navigate to Settings ===");
const settingsNode = current.find((n) => n.label === "Settings");
resolver.choose(settingsNode!.id);
current = resolver.getDisplayableMenu();
console.log(current.map((n) => n.label));
// Output: ['Audio', 'Graphics']

console.log("\n=== Go Back to Top Level ===");
resolver.goBack();
current = resolver.getDisplayableMenu();
console.log(current.map((n) => n.label));
// Output: ['Settings', 'Exit']

console.log("\n=== Try to go back again (should error) ===");
try {
  resolver.goBack();
} catch (error) {
  console.log("Error:", (error as Error).message);
  // Output: Error: You haven't chosen any node
}
