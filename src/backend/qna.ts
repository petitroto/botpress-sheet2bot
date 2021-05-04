import _ from 'lodash'
import {customAlphabet} from 'nanoid'

export class Qna {
  id: string
  data: QnaData

  constructor(record: any) {
    // ID指定が無かったら生成（これはmakeIntentでも使う）
    if (!record.qna_id) {
      record.qna_id = generateNewQnaId()
    }
    this.id = record.qna_id
    this.data = new QnaData(record)
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

function generateNewQnaId() {
  const allowedLetters = '1234567890abcdefghijklmnopqrsuvwxyz'
  return customAlphabet(allowedLetters, 10)() + '_'
}

/**
 * Returns an iterator that iterates integers in [start, end).
 */
function* range(start, end) {
  for (let i = start; i < end; i++) {
    yield i
  }
}