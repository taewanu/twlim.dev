import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/utils';

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
  return (
    <li className={cn(aside ? 'flex justify-between gap-6' : undefined, className)}>
      <span>
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
