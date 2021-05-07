import * as XLSX from 'xlsx'
import {IntentQna, EntityRecord, TextRecord} from './typings'

export class BotSheet {
  intentQnas: IntentQna[]
  entities: EntityRecord[]
  textRecords: TextRecord[]

  constructor(intentQnas, entities, textRecords) {
    this.intentQnas = intentQnas
    this.entities = entities
    this.textRecords = textRecords
  }

  static fromFile(sheetFilePath: string): BotSheet {
    const workbook = XLSX.readFile(sheetFilePath)

    const intentQnas: IntentQna[] = XLSX.utils.sheet_to_json(workbook.Sheets['intent_qna'])
    if (!intentQnas || intentQnas.length === 0) {
      return null
    }

    const entities: EntityRecord[] = XLSX.utils.sheet_to_json(workbook.Sheets['entities'])
    if (!entities || entities.length === 0) {
      return null
    }

    const textRecords: TextRecord[] = XLSX.utils.sheet_to_json(workbook.Sheets['builtin_text'])
    if (!textRecords || textRecords.length === 0) {
      return null
    }

    return new BotSheet(intentQnas, entities, textRecords)
  }
}
