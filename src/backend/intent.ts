import _ from 'lodash'
import {nanoid} from 'nanoid'
import {range} from './utils'

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
          record[`slot${index}_id`] = this.generateSlotId()
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

  generateSlotId() {
    return nanoid()
  }
}
