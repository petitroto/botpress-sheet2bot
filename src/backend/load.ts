import * as sdk from 'botpress/sdk'
import * as XLSX from 'xlsx'

import {IntentQna} from './typings'

export default (bp: typeof sdk, sheetFilePath: string): IntentQna[] => {

  const workbook = XLSX.readFile(sheetFilePath)
  const sheet = workbook.Sheets['intent_qna']
  return XLSX.utils.sheet_to_json(sheet)
}
