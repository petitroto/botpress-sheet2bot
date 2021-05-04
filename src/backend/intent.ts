import _ from 'lodash'
import {nanoid} from 'nanoid'

interface Slot {
  id: string
  name: string
  entities: Array<string>
  color: string
}

export class Intent {
  name: string
  contexts: Array<string>
  utterances: {
    ja: Array<string>
  }
  slots: Array<Slot>

  constructor(record: any) {
    this.name = record.intent_name || `__qna__${record.qna_id}`
    this.contexts = _.chain([...range(1, 6)])
      .map(i => record[`context${i}`])
      .compact()
      .value()
    this.utterances = {
      ja: _.chain([...range(1, 11)])
        .map(i => record[`question${i}`])
        .compact()
        .value()
    }
    this.slots = _.chain([...range(1, 6)])
      .map(index => ({index, slotName: record[`slot${index}_name`]}))
      .filter(data => data.slotName != null)
      .map(({index}) => {
        // ID指定がなかったら生成する
        if (!record[`slot${index}_id`]) {
          record[`slot${index}_id`] = nanoid()
        }
        return {
          id: record[`slot${index}_id`],
          name: record[`slot${index}_name`],
          entities: record[`slot${index}_entities`].split(','),
          color: record[`slot${index}_color`]
        }
      })
      .value()
  }
}

/**
 * Returns an iterator that iterates integers in [start, end).
 */
function* range(start, end) {
  for (let i = start; i < end; i++) {
    yield i
  }
}
