import _ from 'lodash'
import {nanoid} from 'nanoid'

export function* range(start, end) {
  for (let i = start; i < end; i++) {
    yield i
  }
}

export function generateElementId(contentTypeId: string): string {
  const prefix = contentTypeId.replace(/^#/, '')
  return `${prefix}-${nanoid(6)}`
}

export function flatMap<T, U>(array: T[], callbackfn: (value: T, index: number, array: T[]) => U[]): U[] {
  return Array.prototype.concat(...array.map(callbackfn));
}

export function mergeObjects(srcObjects, givenObjects, key) {
  const srcOnlyObjects = _.differenceBy(srcObjects, givenObjects, key)
  const conflictGivenObjects = _.intersectionBy(givenObjects, srcObjects, key)
  const givenOnlyObjects = _.differenceBy(givenObjects, srcObjects, key)
  return [...srcOnlyObjects, ...conflictGivenObjects, ...givenOnlyObjects]
}
