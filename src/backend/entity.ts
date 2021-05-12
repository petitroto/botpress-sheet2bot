import _ from 'lodash'
import {EntityRecord} from './typings'
import {range} from './utils'

interface Occurrence {
  name: string
  synonyms: string[]
}

export class Entity {
  id: string
  name: string
  type: string
  occurrences: Occurrence[]
  sensitive: boolean
  fuzzy: number
  examples: string[]
  pattern: string
  matchCase: boolean

  constructor(raw: Partial<Entity>) {
    Object.assign(this, raw)
  }

  static fromRecord(record: EntityRecord): Entity {
    const raw: any = {}
    raw.id = record.id
    raw.name = record.name
    raw.type = record.type
    raw.sensitive = record.sensitive
    raw.fuzzy = record.fuzzy
    raw.pattern = record.pattern
    raw.matchCase = record.matchCase
    raw.occurrences = _.chain([...range(1, 11)])
      .map(ocIndex => ({ocIndex, name: record[`occur${ocIndex}`]}))
      .filter(data => data.name != null)
      .map(({ocIndex, name}) => {
        const synonyms = _.chain([...range(1, 6)])
          .map(syIndex => record[`occur${ocIndex}_${syIndex}`])
          .compact()
          .value()
        return {name, synonyms}
      })
      .value()
    raw.examples = _.chain([...range(1, 11)])
      .map(i => record[`ex${i}`])
      .compact()
      .value()
    return new Entity(raw)
  }

  toRecord(): EntityRecord {
    const occurrences = this.occurrences
      .reduce((ocMemo, occurrence, ocIndex) => {
        ocMemo[`occur${ocIndex + 1}`] = occurrence.name
        const synonyms = occurrence.synonyms
          .reduce((syMemo, synonym, syIndex) => {
            syMemo[`occur${ocIndex + 1}_${syIndex + 1}`] = synonym
            return syMemo
          }, {})
        return {...ocMemo, ...synonyms}
      }, {})
    const examples = this.examples
      .reduce((memo, example, index) => {
        memo[`ex${index + 1}`] = example
        return memo
      }, {})

    return {
      id: this.id,
      name: this.name,
      sensitive: this.sensitive,
      type: this.type,
      fuzzy: this.fuzzy,
      pattern: this.pattern,
      matchCase: this.matchCase,
      ...occurrences,
      ...examples
    } as EntityRecord
  }
}
