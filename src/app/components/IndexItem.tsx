import type { ComponentProps, ReactNode } from 'react';

import { opensInDrawer } from '@/lib/article';
import { cn } from '@/lib/utils';

import { LastReadDot } from './LastReadDot';
import { TextLink } from './TextLink';

export function IndexItem({
  href,
  title,
  summary,
  aside,
  className,
  linkProps,
  children,
}: {
  href: string;
  title: string;
  summary: ReactNode;
  aside?: ReactNode;
  className?: string;
  linkProps?: Omit<ComponentProps<'a'>, 'href' | 'children'>;
  children?: ReactNode;
}) {
  const swipeable = opensInDrawer(href);
  return (
    <li
      data-swipe-article={swipeable ? href : undefined}
      className={cn(
        // While another row is swiped open, this one steps back; the drawer sets these attributes.
        'relative transition-opacity duration-150 in-data-swipe-arming:not-data-swipe-armed:opacity-35',
        aside && 'flex justify-between gap-6',
        className,
      )}
    >
      <span>
        {swipeable && <LastReadDot href={href} title={title} />}
        <TextLink href={href} {...linkProps}>
          {title}
        </TextLink>
        <span className="text-muted"> · {summary}</span>
        {/* Children stay siblings of the link so they can react to its peer hover and focus. */}
        {children}
      </span>
      {aside && <span className="shrink-0 text-muted">{aside}</span>}
    </li>
  );
}
