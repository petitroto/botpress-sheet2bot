import * as XLSX from 'xlsx'
import {BotSheet, IntentQna} from './typings'

export default (sheetFilePath: string): BotSheet => {

  const workbook = XLSX.readFile(sheetFilePath)
  const sheet = workbook.Sheets['intent_qna']
  const intentQnas: IntentQna[] = XLSX.utils.sheet_to_json(sheet)

  if (!intentQnas || intentQnas.length === 0) {
    return null
  }

  return {intentQnas}
}
