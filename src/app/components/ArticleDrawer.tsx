'use client';

import { Dialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useRef, useState, useSyncExternalStore } from 'react';

import { ARTICLE_TITLE_ID } from './Article';
import { RememberArticleContext } from './RememberArticle';

const PANEL =
  'fixed inset-0 mx-auto w-drawer max-w-full bg-bg text-text outline-none transition-[translate] duration-(--duration-drawer) ease-drawer motion-reduce:transition-none';
const SCROLLER =
  'h-full touch-pan-y touch-pinch-zoom overflow-y-auto overscroll-contain outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';
const CHROME_BUTTON =
  'flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-code-bg hover:text-text focus-visible:outline-1 focus-visible:outline-muted';

const noSubscription = () => () => {};

/**
 * Opens an article as a centered panel over the index, which slides left until only its right
 * edge shows. The URL decides what is open; gestures and the close button navigate.
 */
export function ArticleDrawer({ article, children }: { article: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
  const [route, setRoute] = useState({
    pathname,
    previous: null as string | null,
    lastArticle: pathname === '/' ? null : pathname,
  });
  // Follows the URL, but flips ahead of a navigation so the slide starts without waiting for it.
  const [open, setOpen] = useState(pathname !== '/');
  if (route.pathname !== pathname) {
    setRoute({
      pathname,
      previous: route.pathname,
      lastArticle: pathname === '/' ? route.lastArticle : pathname,
    });
    setOpen(pathname !== '/');
  }
  const [remembered, setRemembered] = useState<ReactNode>(null);
  const content = pathname === '/' ? remembered : article;

  const scrollerRef = useRef<HTMLDivElement>(null);

  function goHome() {
    if (route.previous === '/') router.back();
    else router.push('/', { scroll: false });
  }

  function close() {
    setOpen(false);
    goHome();
  }

  return (
    <RememberArticleContext value={setRemembered}>
      <div
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

              <div className="absolute top-4 right-4">
                <Dialog.Close aria-label="Close" className={CHROME_BUTTON}>
                  <X className="size-4" />
                </Dialog.Close>
              </div>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </RememberArticleContext>
  );
}
