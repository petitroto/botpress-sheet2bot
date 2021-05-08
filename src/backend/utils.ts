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
