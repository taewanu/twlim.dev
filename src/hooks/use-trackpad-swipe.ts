import { useEffect } from 'react';

import { listenForTrackpadSwipes } from '@/lib/trackpad-swipe';

import type { DrawerDrag } from './use-drawer-drag';

/** A two-finger horizontal swipe drives the same drag as touch. */
export function useTrackpadSwipe(drag: DrawerDrag, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return undefined;
    const listeners = new AbortController();
    listenForTrackpadSwipes(drag, listeners.signal);
    return () => listeners.abort();
  }, [drag, enabled]);
}
