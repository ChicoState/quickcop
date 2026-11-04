import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import type { WatchedItem } from "./WatchedItemsScreen";

type WatchedItemsContextValue = {
  items: WatchedItem[];
  setItems: Dispatch<SetStateAction<WatchedItem[]>>;
};

const WatchedItemsContext = createContext<WatchedItemsContextValue | null>(
  null,
);

export function WatchedItemsProvider({
  children,
  initialItems = [],
}: {
  children: ReactNode;
  initialItems?: WatchedItem[];
}) {
  const [items, setItems] = useState<WatchedItem[]>(initialItems);
  const value = useMemo(() => ({ items, setItems }), [items]);

  return (
    <WatchedItemsContext.Provider value={value}>
      {children}
    </WatchedItemsContext.Provider>
  );
}

export function useWatchedItems() {
  return useContext(WatchedItemsContext);
}
