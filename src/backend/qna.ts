import _ from 'lodash'
import {customAlphabet} from 'nanoid'
import {range} from './utils'

export class Qna {
  id: string
  data: QnaData

  constructor(record: any) {
    // ID指定が無かったら生成（これはmakeIntentでも使う）
    if (!record.qna_id) {
      record.qna_id = this.generateId()
    }
    this.id = record.qna_id
    this.data = new QnaData(record)
  }

  generateId() {
    const allowedLetters = '1234567890abcdefghijklmnopqrsuvwxyz'
    return customAlphabet(allowedLetters, 10)() + '_'
  }
}

class QnaData {
  action: string
  contexts: Array<string>
  enabled: boolean
  answers: {
    ja: Array<string>
  }
  questions: {
    ja: Array<string>
  }
  redirectFlow: string
  redirectNode: string

  constructor(record) {
    this.action = record.action
    this.enabled = record.enabled
    this.contexts = _.chain([...range(1, 6)])
      .map(i => record[`context${i}`])
      .compact()
      .value()
    this.answers = {
      ja: _.chain([...range(1, 11)])
        .map(i => record[`answer${i}`])
        .compact()
        .map(answer => answer.replace(/\r\n/g, '\n'))
        .value()
    }
    this.questions = {
      ja: _.chain([...range(1, 11)])
        .map(i => record[`question${i}`])
        .compact()
        .value()
    }
    this.redirectFlow = record.redirectFlow
    this.redirectNode = record.redirectNode
  }
}
