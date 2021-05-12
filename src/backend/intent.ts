import _ from 'lodash'
import {nanoid} from 'nanoid'
import {IntentRecord} from './typings'
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

  constructor(raw: Partial<Intent>) {
    Object.assign(this, raw)
  }

  static fromRecord(record: IntentRecord): Intent {
    const raw: any = {}
    raw.name = record.name
    raw.contexts = _.chain([...range(1, 6)])
      .map(i => record[`context${i}`])
      .compact()
      .value()
    raw.utterances = {
      ja: _.chain([...range(1, 21)])
        .map(i => record[`utterance${i}`])
        .compact()
        .value()
    }
    raw.slots = _.chain([...range(1, 4)])
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
    return new Intent(raw)
  }

  static generateSlotId() {
    return nanoid()
  }

  toRecord(): IntentRecord {
    const contexts = this.contexts
      .reduce((memo, context, index) => {
        memo[`context${index + 1}`] = context
        return memo
      }, {})
    const utterances = this.utterances.ja
      .reduce((memo, utterance, index) => {
        memo[`utterance${index + 1}`] = utterance
        return memo
      }, {})
    const slots = this.slots
      .reduce((memo, slot, index) => {
        memo[`slot${index + 1}_id`] = slot.id
        memo[`slot${index + 1}_name`] = slot.name
        memo[`slot${index + 1}_entities`] = slot.entities.join(',')
        memo[`slot${index + 1}_color`] = slot.color
        return memo
      }, {})

    return {
      name: this.name,
      ...contexts,
      ...utterances,
      ...slots
    } as IntentRecord
  }
}
