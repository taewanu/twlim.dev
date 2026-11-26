import type { ReactNode } from 'react';

export function IndexList({ children }: { children: ReactNode }) {
  return <ul className="space-y-3">{children}</ul>;
}
