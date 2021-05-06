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

  constructor(record: EntityRecord) {
    this.id = record.id
    this.name = record.name
    this.type = record.type
    this.sensitive = record.sensitive
    this.fuzzy = record.fuzzy
    this.pattern = record.pattern
    this.matchCase = record.matchCase

    this.occurrences = _.chain([...range(1, 11)])
      .map(ocIndex => ({ocIndex, name: record[`occur${ocIndex}`]}))
      .filter(data => data.name != null)
      .map(({ocIndex, name}) => {
        const synonyms = _.chain([...range(1, 11)])
          .map(syIndex => record[`occur${ocIndex}_${syIndex}`])
          .compact()
          .value()
        return {name, synonyms}
      })
      .value()

    this.examples = _.chain([...range(1, 11)])
      .map(i => record[`ex${i}`])
      .compact()
      .value()
  }
}
