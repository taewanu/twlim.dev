import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

export function TextLink({
  href,
  children,
  ...props
}: ComponentProps<'a'> & { href: string; children: ReactNode }) {
  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }
  if (href.startsWith('http')) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
