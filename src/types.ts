export type Node = {
  id: string;
  label: string;
  resolve?: () => void | any;
  parentKey: string | null;
}

export type ResolverAPI = {
  goBack: () => void,
}

export type Menu = Prettify<MenuParent | MenuActionSimple | MenuActionCustom>;

export type MenuParent = {
  label: string;
  children: Menu[];
  resolve?: undefined;
};

export type MenuActionSimple = {
  label: string;
  resolve: string;
  children?: Menu[] | undefined;
};

export type MenuActionCustom = {
  label: string;
  resolve: (rsApi: ResolverAPI) => any;
  children?: Menu[] | undefined;
};

// just utils
type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};