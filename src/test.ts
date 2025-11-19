import type { TreeMenu } from "./index.js";

const complexTree: TreeMenu[] = [
  {
    label: "Go inside the tree",
    resolve: () => console.log("going inside the tree"),
    children: [
      {
        label: "Node1:Node1",
        resolve: () => console.log("Node1:Node1"),
        children: [],
      },
      {
        label: "Node1:Node2",
        resolve: () => console.log("Node1:Node2"),
        children: [
          {
            label: "Node1:Node2:Node1",
            resolve: () => console.log("Node1:Node2:Node1"),
            children: [],
          },
          {
            label: "Node1:Node:2:Node2",
            resolve: () => console.log("Node1:Node:2:Node2"),
            children: [],
          },
        ],
      },
      {
        label: "Node1:Node3",
        children: [],
        resolve: () => console.log("Node1:Node3"),
      },
    ],
  },
  {
    label: "Prueba menu 1",
    children: [],
    resolve: () => console.log("Prueba 1"),
  },
  {
    label: "Prueba menu 2",
    children: [
      {
        label: "Prueba menu 2 1",
        children: [],
        resolve: () => console.log("Prueba 2"),
      },
      {
        label: "Prueba menu 2 2",
        children: [],
        resolve: () => console.log("Prueba 2"),
      },
    ],
    resolve: () => console.log("Prueba 2"),
  },
  {
    label: "Prueba menu 3",
    children: [],
    resolve: () => console.log("Prueba 3"),
  },
];

const easyTree = [
  {
    label: "Node 1",
    children: [
      {
        label: "Node 1: child 1",
        children: [
          {
            label: "Node 1: child 1: subchild: 1",
            children: [],
            resolve: () => "Node 1: child 1: subchild: 1",
          },
        ],
        resolve: () => "Node 1: child 1",
      },
    ],
    resolve: () => console.log("Node 1"),
  },
  {
    label: "Node 2",
    resolve: () => console.log("Node 2"),
    children: [
      {
        label: "Node 2: child 1",
        children: [],
        resolve: () => console.log("Node 2: child 1"),
      },
    ],
  },
];

export const treeMenuTest = complexTree;
