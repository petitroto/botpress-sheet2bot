import * as XLSX from 'xlsx'
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
}

function getSheetAsJson(workbook, sheetName): any {
  return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])
}
