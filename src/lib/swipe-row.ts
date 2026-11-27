/** The index row under a point, found by its box because the closing panel keeps the index inert. */
export function swipeRowAt(x: number, y: number) {
  for (const row of document.querySelectorAll<HTMLElement>('[data-swipe-article]')) {
    const box = row.getBoundingClientRect();
    if (x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) return row;
  }
  return null;
}
