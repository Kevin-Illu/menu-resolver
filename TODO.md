# Things I wanna get done

### How do I wanna use the `TreeMenuResolver` in my system

Tree menu definition

```ts
// define the resolver
const tree = { ...TreeMenu };
const TreeMenuManager = new TreeMenuResolver(tree);
```

Then I just wanna resolve the first deeph of the tree
like getting the first menu to show to the user and then
printing them in the console or werever UI I choose

Getting the first options of the menu

```ts
// the choose type looks like this
type UserChose = {
  id: string;
  resolve: () => any;
};

// at this point if the tree has children then the currentNode change
const menu = TreeManuManager.getDisplayableMenu();
// your code to print the menu
const selectedOptionId = UIManager.render(menu);
const userChose = TreeMenuManager.choose(selectedOptionId);
const executeResults = userChose.resolve();

// When I execute getDisplayableMenu() again it would return the children with
// his options because it already change it by calling the `choose` function
```

The last code should run in a loop manage by the user not the manager.
