'use client';

import { Dialog } from '@base-ui/react/dialog';
import { Toggle } from '@base-ui/react/toggle';
import { Volume2, VolumeX, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useCallback, useLayoutEffect, useRef, useState } from 'react';

import { useDrawerDrag } from '@/hooks/use-drawer-drag';
import { useHydrated } from '@/hooks/use-hydrated';
import { markSwipeLearned, useSwipeHint } from '@/hooks/use-swipe-hint';
import { useTickSound } from '@/hooks/use-tick-sound';
import { useTouchSwipe } from '@/hooks/use-touch-swipe';
import { useTrackpadSwipe } from '@/hooks/use-trackpad-swipe';
import { ARTICLE_TITLE_ID, isIndexPage } from '@/lib/article';

import { ArticleBody } from './ArticleBody';
import { LastReadContext } from './LastReadDot';
import { RememberArticleContext } from './RememberArticle';
import { SectionScrubber } from './SectionScrubber';

const PANEL =
  'fixed inset-0 mx-auto w-drawer max-w-full bg-bg text-text outline-none transition-[translate] duration-(--duration-drawer) ease-drawer motion-reduce:transition-none';
const SCROLLER =
  'h-full touch-pan-y touch-pinch-zoom overflow-y-auto overscroll-contain outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';
const CHROME_BUTTON =
  'flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-code-bg hover:text-text focus-visible:outline-1 focus-visible:outline-muted';

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
  const hydrated = useHydrated();
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
  // A row swiped open before its article has loaded shows just its title until the page arrives.
  const [preview, setPreview] = useState<{ href: string; title: string } | null>(null);
  const remember = useCallback((node: ReactNode) => {
    setRemembered(node);
    setPreview(null);
  }, []);

  const indexRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);
  const handoffScroll = useRef(0);
  // Runs in the hydration commit, so a reader who scrolled the server-rendered panel keeps their place.
  useLayoutEffect(() => {
    handoffScroll.current = fallbackRef.current?.scrollTop ?? 0;
  }, []);
  const sound = useTickSound();
  useSwipeHint(indexRef, onIndex);

  function goToIndex() {
    if (isBehind(route.index)) router.back();
    else router.push(route.index, { scroll: false });
  }

  // A swipe opens the row it starts on; on empty space it reopens the last article.
  const targetOf = (row: HTMLElement | null) => row?.dataset.swipeArticle ?? route.lastArticle;

  function close() {
    setOpen(false);
    goToIndex();
  }

  const drag = useDrawerDrag({
    open,
    panelRef,
    indexRef,
    setOpen,
    canOpen: (row) => targetOf(row) !== null,
    onOpenStart: (row) => {
      const href = targetOf(row);
      const title = row?.querySelector('a')?.textContent ?? '';
      setPreview(href && href !== route.lastArticle ? { href, title } : null);
    },
    onCommit: (closing, row) => {
      if (closing) return goToIndex();
      markSwipeLearned();
      const href = targetOf(row);
      if (href) router.push(href, { scroll: false });
    },
  });
  useTouchSwipe(drag, hydrated);
  useTrackpadSwipe(drag, hydrated);

  return (
    <RememberArticleContext value={remember}>
      <div
        ref={indexRef}
        data-open={open ? '' : undefined}
        className="touch-pan-y touch-pinch-zoom transition-[translate,opacity] duration-(--duration-drawer) ease-drawer [--index-shift:calc(var(--spacing-peek)-(100vw+min(var(--container-xl),100vw))/2)] motion-reduce:transition-none data-open:translate-x-(--index-shift) data-open:opacity-(--index-opacity)"
      >
        <LastReadContext value={open ? null : route.lastArticle}>{children}</LastReadContext>
      </div>

      {/* The slot renders here before and after hydration, so Next never remounts the article. */}
      <div className={!hydrated && open ? PANEL : 'hidden'}>
        <div ref={fallbackRef} className={SCROLLER}>
          {article}
        </div>
      </div>

      {hydrated && (
        <Dialog.Root
          open={open}
          onOpenChange={(next) => {
            if (!next) close();
          }}
        >
          <Dialog.Portal keepMounted>
            <Dialog.Backdrop className="fixed inset-0 cursor-w-resize touch-pan-y touch-pinch-zoom" />
            <Dialog.Popup
              ref={panelRef}
              initialFocus={scrollerRef}
              aria-labelledby={ARTICLE_TITLE_ID}
              className={`${PANEL} data-ending-style:translate-x-[100vw] data-starting-style:translate-x-[100vw]`}
            >
              <div
                key={`scroller:${route.lastArticle}`}
                ref={(scroller) => {
                  scrollerRef.current = scroller;
                  if (scroller && handoffScroll.current) {
                    scroller.scrollTop = handoffScroll.current;
                    handoffScroll.current = 0;
                  }
                }}
                tabIndex={-1}
                className={SCROLLER}
              >
                {remembered}
              </div>

              {/* Covers the last article instead of replacing it, so a swipe that springs back keeps it mounted. */}
              {preview && (
                <div className="absolute inset-0 overflow-hidden bg-bg">
                  <ArticleBody title={preview.title} titleId={null} />
                </div>
              )}

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

              {!preview && (
                <SectionScrubber
                  key={`scrubber:${route.lastArticle}`}
                  scrollerRef={scrollerRef}
                  onSnap={() => sound.play()}
                />
              )}
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </RememberArticleContext>
  );
}
