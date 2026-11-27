import { useSyncExternalStore } from 'react';

const noSubscription = () => () => {};

/** False on the server and during hydration, true from the first client render after it. */
export function useHydrated() {
  return useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
}
