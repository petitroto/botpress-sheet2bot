import _ from 'lodash'
import {customAlphabet} from 'nanoid'
import {QnaRecord} from './typings'
import {range} from './utils'

export class Qna {
  id: string
  data: {
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
  }

  constructor(raw: Partial<Qna>) {
    Object.assign(this, raw)
  }

  static fromRecord(record: QnaRecord): Qna {
    const raw: any = {}
    // ID指定が無かったら生成（これはmakeIntentでも使う）
    raw.id = record.id ? record.id : this.generateId()
    raw.data = {}
    raw.data.action = record.action
    raw.data.enabled = record.enabled
    raw.data.contexts = _.chain([...range(1, 6)])
      .map(i => record[`context${i}`])
      .compact()
      .value()
    raw.data.questions = {
      ja: _.chain([...range(1, 21)])
        .map(i => record[`question${i}`])
        .compact()
        .value()
    }
    raw.data.answers = {
      ja: _.chain([...range(1, 6)])
        .map(i => record[`answer${i}`])
        .compact()
        .map(answer => answer.replace(/\r\n/g, '\n'))
        .value()
    }
    raw.data.redirectFlow = record.redirectFlow
    raw.data.redirectNode = record.redirectNode
    return new Qna(raw)
  }

  static generateId() {
    const allowedLetters = '1234567890abcdefghijklmnopqrsuvwxyz'
    return customAlphabet(allowedLetters, 10)() + '_'
  }

  toRecord(): QnaRecord {
    const contexts = this.data.contexts
      .reduce((memo, context, index) => {
        memo[`context${index + 1}`] = context
        return memo
      }, {})
    const questions = this.data.questions.ja
      .reduce((memo, question, index) => {
        memo[`question${index + 1}`] = question
        return memo
      }, {})
    const answers = this.data.answers.ja
      .reduce((memo, answer, index) => {
        memo[`answer${index + 1}`] = answer
        return memo
      }, {})

    return {
      id: this.id,
      action: this.data.action,
      enabled: this.data.enabled,
      redirectFlow: this.data.redirectFlow,
      redirectNode: this.data.redirectNode,
      ...contexts,
      ...questions,
      ...answers
    } as QnaRecord
  }
}
