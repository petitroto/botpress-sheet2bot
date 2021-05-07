import * as XLSX from 'xlsx'
import {IntentQna, EntityRecord, TextRecord, ChoiceRecord} from './typings'

export class BotSheet {
  intentQnas: IntentQna[]
  entities: EntityRecord[]
  textRecords: TextRecord[]
  choiceRecords: ChoiceRecord[]

  constructor(intentQnas, entities, textRecords, choiceRecords) {
    this.intentQnas = intentQnas
    this.entities = entities
    this.textRecords = textRecords
    this.choiceRecords = choiceRecords
  }

  static fromFile(sheetFilePath: string): BotSheet {
    const book = XLSX.readFile(sheetFilePath)

    const intentQnas: IntentQna[] = getSheetAsJson(book, 'intent_qna')
    const entities: EntityRecord[] = getSheetAsJson(book, 'entities')
    const textRecords: TextRecord[] = getSheetAsJson(book, 'builtin_text')
    const choiceRecords: ChoiceRecord[] = getSheetAsJson(book, 'builtin_single-choice')

    if (!intentQnas && !entities && !textRecords && !choiceRecords) {
      return null
    } else {
      return new BotSheet(intentQnas, entities, textRecords, choiceRecords)
    }
  }
}

function getSheetAsJson(workbook, sheetName): any {
  return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])
}
