'use client';

import { Dialog } from '@base-ui/react/dialog';
import { Toggle } from '@base-ui/react/toggle';
import { Volume2, VolumeX, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useCallback, useLayoutEffect, useRef, useState } from 'react';

import { useDrawerDrag } from '@/hooks/use-drawer-drag';
import { useHydrated } from '@/hooks/use-hydrated';
import { usePointerSwipe } from '@/hooks/use-pointer-swipe';
import { markSwipeLearned, useSwipeHint } from '@/hooks/use-swipe-hint';
import { useTickSound } from '@/hooks/use-tick-sound';
import { useTrackpadSwipe } from '@/hooks/use-trackpad-swipe';
import { ARTICLE_TITLE_ID, isIndexPage } from '@/lib/article';

import { ArticleBody } from './ArticleBody';
import { type LastRead, LastReadContext } from './LastReadDot';
import { RememberArticleContext } from './RememberArticle';
import { SectionScrubber } from './SectionScrubber';

const PANEL =
  'fixed inset-0 mx-auto w-drawer max-w-full bg-bg text-text outline-none transition-[translate] duration-(--duration-drawer) ease-drawer motion-reduce:transition-none';
const SCROLLER =
  'h-full touch-pan-y touch-pinch-zoom overflow-y-auto overscroll-contain outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';
const CHROME_BUTTON =
  'flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-code-bg hover:text-text focus-visible:outline-1 focus-visible:outline-muted';

type Article = { href: string; node: ReactNode };

function rowIdentity(row: HTMLElement): LastRead {
  return {
    href: row.dataset.swipeArticle ?? '',
    title: row.querySelector('a')?.textContent ?? null,
  };
}

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
  // The article the panel holds, plus the one an opening swipe is loading under the finger.
  const [committed, setCommitted] = useState<Article | null>(null);
  const [incoming, setIncoming] = useState<Article | null>(null);
  const loading = useRef<string | null>(null);
  const dropIncoming = useRef<ReturnType<typeof setTimeout>>(undefined);
  const shown = incoming ?? committed;
  // Two rows can link to the same article, so the dot remembers which one the reader used.
  const [usedRow, setUsedRow] = useState<LastRead | null>(null);
  const lastHref = open ? null : route.lastArticle;
  const lastTitle = usedRow && usedRow.href === lastHref ? usedRow.title : null;
  const lastRead = lastHref ? { href: lastHref, title: lastTitle } : null;
  // Until a swiped article's page arrives, the panel shows its title.
  const [preview, setPreview] = useState<{ href: string; title: string } | null>(null);
  const waiting = preview && preview.href !== shown?.href ? preview : null;
  const remember = useCallback((href: string, node: ReactNode) => {
    if (href === loading.current) setIncoming({ href, node });
    else setCommitted({ href, node });
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
  // After a direct visit or a link inside an article, the dot falls back to the first row for it.
  useLayoutEffect(() => {
    if (!lastHref || lastTitle !== null) return;
    const row = indexRef.current?.querySelector<HTMLElement>(
      `[data-swipe-article="${CSS.escape(lastHref)}"]`,
    );
    if (row) setUsedRow(rowIdentity(row));
  }, [lastHref, lastTitle]);
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
      clearTimeout(dropIncoming.current);
      setIncoming(null);
      const href = targetOf(row);
      if (!href || href === committed?.href) return setPreview(null);
      // Opening the URL as the drag starts lets the page render under the finger.
      loading.current = href;
      setPreview({ href, title: row?.querySelector('a')?.textContent ?? '' });
      router.push(href, { scroll: false });
    },
    onCommit: (closing, row) => {
      if (closing) return goToIndex();
      markSwipeLearned();
      if (row) setUsedRow(rowIdentity(row));
      const href = targetOf(row);
      if (href === loading.current) {
        loading.current = null;
        if (incoming) setCommitted(incoming);
        setIncoming(null);
      } else if (href) router.push(href, { scroll: false });
    },
    onSpringBack: (ms) => {
      const href = loading.current;
      if (!href) return;
      loading.current = null;
      // The dot and an empty-space swipe still point at the article that was already open.
      setRoute((current) => ({ ...current, lastArticle: committed?.href ?? null }));
      if (pathname === href) router.back();
      else router.replace(route.index, { scroll: false });
      // The page stays in the panel until it has slid out of sight.
      dropIncoming.current = setTimeout(() => {
        setIncoming(null);
        setPreview(null);
      }, ms);
    },
  });
  usePointerSwipe(drag, hydrated);
  useTrackpadSwipe(drag, hydrated);

  return (
    <RememberArticleContext value={remember}>
      <div
        ref={indexRef}
        onClickCapture={(event) => {
          const row =
            event.target instanceof Element
              ? event.target.closest<HTMLElement>('[data-swipe-article]')
              : null;
          if (row) setUsedRow(rowIdentity(row));
        }}
        data-open={open ? '' : undefined}
        className="touch-pan-y touch-pinch-zoom transition-[translate,opacity] duration-(--duration-drawer) ease-drawer [--index-shift:calc(var(--spacing-peek)-(100vw+min(var(--container-xl),100vw))/2)] motion-reduce:transition-none data-open:translate-x-(--index-shift) data-open:opacity-(--index-opacity)"
      >
        <LastReadContext value={lastRead}>{children}</LastReadContext>
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
            <Dialog.Backdrop className="fixed inset-0 cursor-pointer touch-pan-y touch-pinch-zoom" />
            <Dialog.Popup
              ref={panelRef}
              initialFocus={scrollerRef}
              aria-labelledby={ARTICLE_TITLE_ID}
              className={`${PANEL} data-ending-style:translate-x-[100vw] data-starting-style:translate-x-[100vw]`}
            >
              {/* Incoming comes first, so its title wins the shared id; the committed one stays mounted, hidden. */}
              {[incoming, committed].map(
                (entry) =>
                  entry &&
                  !(entry === committed && incoming?.href === committed.href) && (
                    <div
                      key={`scroller:${entry.href}`}
                      hidden={entry !== shown}
                      ref={
                        entry === shown
                          ? (scroller) => {
                              scrollerRef.current = scroller;
                              if (scroller && handoffScroll.current) {
                                scroller.scrollTop = handoffScroll.current;
                                handoffScroll.current = 0;
                              }
                            }
                          : undefined
                      }
                      tabIndex={-1}
                      className={SCROLLER}
                    >
                      {entry.node}
                    </div>
                  ),
              )}

              {waiting && (
                <div className="absolute inset-0 overflow-hidden bg-bg">
                  <ArticleBody title={waiting.title} titleId={null} />
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

              {shown && !waiting && (
                <SectionScrubber
                  key={`scrubber:${shown.href}`}
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
