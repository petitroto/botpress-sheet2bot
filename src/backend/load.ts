import * as XLSX from 'xlsx'
import {BotSheet, IntentQna, EntityRecord, TextRecord} from './typings'

export default (sheetFilePath: string): BotSheet => {

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

  return {intentQnas, entities, textRecords}
}
