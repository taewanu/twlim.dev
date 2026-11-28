import { useEffect } from 'react';

import { listenForPointerSwipes } from '@/lib/pointer-swipe';

import type { DrawerDrag } from './use-drawer-drag';

/** Drags the article right to close it, or an index row left to open its article, by touch or mouse. */
export function usePointerSwipe(drag: DrawerDrag, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return undefined;
    const listeners = new AbortController();
    listenForPointerSwipes(drag, listeners.signal);
    return () => listeners.abort();
  }, [drag, enabled]);
}
