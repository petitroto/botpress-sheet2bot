/**
 * Returns an iterator that iterates integers in [start, end).
 */
export function* range(start, end) {
  for (let i = start; i < end; i++) {
    yield i
  }
}
