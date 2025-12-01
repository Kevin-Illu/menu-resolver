export type Node = {
  id: string;
  label: string;
  resolve?: () => void | any;
  parentKey: string | null;
}

export type ResolverAPI = {
  goBack: () => void,
}

export type Menu = MenuParent | MenuActionSimple | MenuActionCustom;

export type MenuParent = {
  label: string;
  children: Menu[];
  resolve?: undefined;
};

export type MenuActionSimple = {
  label: string;
  resolve: string;
  children?: undefined;
};

export type MenuActionCustom = {
  label: string;
  resolve: (rsApi: ResolverAPI) => any;
  children?: undefined;
};