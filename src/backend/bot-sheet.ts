import * as XLSX from 'xlsx'
import {BotContent} from './bot-content'
import {IntentRecord, QnaRecord, EntityRecord, TextRecord, ChoiceRecord} from './typings'

export class BotSheet {
  qnaRecords: QnaRecord[]
  intentRecords: IntentRecord[]
  entityRecords: EntityRecord[]
  textRecords: TextRecord[]
  choiceRecords: ChoiceRecord[]

  constructor(qnaRecords, intentRecords, entityRecords, textRecords, choiceRecords) {
    this.qnaRecords = qnaRecords
    this.intentRecords = intentRecords
    this.entityRecords = entityRecords
    this.textRecords = textRecords
    this.choiceRecords = choiceRecords
  }

  static fromFile(sheetFilePath: string): BotSheet {
    const book = XLSX.readFile(sheetFilePath)

    const qnaRecords: QnaRecord[] = getSheetAsJson(book, 'qna')
    const intentRecords: IntentRecord[] = getSheetAsJson(book, 'intent')
    const entityRecords: EntityRecord[] = getSheetAsJson(book, 'entity')
    const textRecords: TextRecord[] = getSheetAsJson(book, 'builtin_text')
    const choiceRecords: ChoiceRecord[] = getSheetAsJson(book, 'builtin_single-choice')

    if (!qnaRecords && !intentRecords && !entityRecords && !textRecords && !choiceRecords) {
      return null
    } else {
      return new BotSheet(qnaRecords, intentRecords, entityRecords, textRecords, choiceRecords)
    }
  }

  static fromContent(botContent: BotContent): BotSheet {

    const qnaRecords: QnaRecord[] = botContent.qnas.map(qna => qna.toRecord())
    const intentRecords: IntentRecord[] = botContent.intents.map(intent => intent.toRecord())
    const entityRecords: EntityRecord[] = botContent.entities.map(entity => entity.toRecord())
    const textRecords: TextRecord[] = botContent.textContents.map(textContent => textContent.toRecord())
    const choiceRecords: ChoiceRecord[] = botContent.choiceContents.map(choiceContent => choiceContent.toRecord())

    return new BotSheet(qnaRecords, intentRecords, entityRecords, textRecords, choiceRecords)
  }

  toFile(): Buffer {
    const sheetDefs: Array<any> = [
      {name: 'qna', data: this.qnaRecords},
      {name: 'intent', data: this.intentRecords},
      {name: 'entity', data: this.entityRecords},
      {name: 'text', data: this.textRecords},
      {name: 'choice', data: this.choiceRecords},
    ]

    const book = sheetDefs.reduce((memo, def) => {
      const sheet = XLSX.utils.json_to_sheet(def.data)
      XLSX.utils.book_append_sheet(memo, sheet, def.name)
      return memo
    }, XLSX.utils.book_new())

    return XLSX.write(book, {type: 'buffer'})
  }
}

function getSheetAsJson(workbook, sheetName): any {
  return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])
}
