'use client';

import { Dialog } from '@base-ui/react/dialog';
import { Toggle } from '@base-ui/react/toggle';
import { Volume2, VolumeX, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useRef, useState, useSyncExternalStore } from 'react';

import { useDrawerDrag } from '@/hooks/use-drawer-drag';
import { useTickSound } from '@/hooks/use-tick-sound';
import { useTouchSwipe } from '@/hooks/use-touch-swipe';
import { useTrackpadSwipe } from '@/hooks/use-trackpad-swipe';
import { ARTICLE_TITLE_ID, isIndexPage } from '@/lib/article';

import { RememberArticleContext } from './RememberArticle';
import { SectionScrubber } from './SectionScrubber';

const PANEL =
  'fixed inset-0 mx-auto w-drawer max-w-full bg-bg text-text outline-none transition-[translate] duration-(--duration-drawer) ease-drawer motion-reduce:transition-none';
const SCROLLER =
  'h-full touch-pan-y touch-pinch-zoom overflow-y-auto overscroll-contain outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';
const CHROME_BUTTON =
  'flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-code-bg hover:text-text focus-visible:outline-1 focus-visible:outline-muted';

const noSubscription = () => () => {};

// Back is safe only when that index page is the entry behind; before a direct visit it would leave the site.
function isBehind(pathname: string) {
  if (typeof navigation === 'undefined' || !navigation.currentEntry) return false;
  const behind = navigation.entries()[navigation.currentEntry.index - 1];
  return behind?.url ? new URL(behind.url).pathname === pathname : false;
}

/**
 * Opens an article as a centered panel over the index page it was opened from, which slides left
 * until only its right edge shows. The URL decides what is open; gestures and the close button navigate.
 */
export function ArticleDrawer({ article, children }: { article: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
  const onIndex = isIndexPage(pathname);
  const [route, setRoute] = useState({
    pathname,
    index: onIndex ? pathname : '/',
    lastArticle: onIndex ? null : pathname,
  });
  // Follows the URL, but flips ahead of a navigation so the slide starts without waiting for it.
  const [open, setOpen] = useState(!onIndex);
  if (route.pathname !== pathname) {
    setRoute({
      pathname,
      index: onIndex ? pathname : route.index,
      lastArticle: onIndex ? route.lastArticle : pathname,
    });
    setOpen(!onIndex);
  }
  const [remembered, setRemembered] = useState<ReactNode>(null);
  const content = onIndex ? remembered : article;

  const indexRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sound = useTickSound();

  function goToIndex() {
    if (isBehind(route.index)) router.back();
    else router.push(route.index, { scroll: false });
  }

  function close() {
    setOpen(false);
    goToIndex();
  }

  const drag = useDrawerDrag({
    open,
    panelRef,
    indexRef,
    setOpen,
    onCommit: (closed) => {
      if (closed) goToIndex();
      else if (route.lastArticle) router.push(route.lastArticle, { scroll: false });
    },
  });
  const canSwipe = hydrated && (open || route.lastArticle !== null);
  useTouchSwipe(drag, canSwipe);
  useTrackpadSwipe(drag, canSwipe);

  return (
    <RememberArticleContext value={setRemembered}>
      <div
        ref={indexRef}
        data-open={open ? '' : undefined}
        className="touch-pan-y touch-pinch-zoom transition-[translate,opacity] duration-(--duration-drawer) ease-drawer [--index-opacity:0.4] [--index-shift:calc(var(--spacing-peek)-(100vw+min(var(--container-xl),100vw))/2)] motion-reduce:transition-none data-open:translate-x-(--index-shift) data-open:opacity-(--index-opacity)"
      >
        {children}
      </div>

      {/* Base UI portals render only in the browser, so a direct visit gets the open panel as plain HTML first. */}
      {!hydrated && open && (
        <div className={PANEL}>
          <div className={SCROLLER}>{content}</div>
        </div>
      )}

      {hydrated && (
        <Dialog.Root
          open={open}
          onOpenChange={(next) => {
            if (!next) close();
          }}
        >
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 cursor-w-resize" />
            <Dialog.Popup
              ref={panelRef}
              initialFocus={scrollerRef}
              aria-labelledby={ARTICLE_TITLE_ID}
              className={`${PANEL} data-ending-style:translate-x-[100vw] data-starting-style:translate-x-[100vw]`}
            >
              <div
                key={`scroller:${route.lastArticle}`}
                ref={scrollerRef}
                tabIndex={-1}
                className={SCROLLER}
              >
                {content}
              </div>

              <div className="absolute top-4 right-4 flex gap-1">
                <Toggle
                  pressed={sound.enabled}
                  onPressedChange={sound.setEnabled}
                  aria-label="Scrubber sound"
                  className={CHROME_BUTTON}
                >
                  {sound.enabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                </Toggle>
                <Dialog.Close aria-label="Close" className={CHROME_BUTTON}>
                  <X className="size-4" />
                </Dialog.Close>
              </div>

              <SectionScrubber
                key={`scrubber:${route.lastArticle}`}
                scrollerRef={scrollerRef}
                onSnap={() => sound.play()}
              />
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </RememberArticleContext>
  );
}
