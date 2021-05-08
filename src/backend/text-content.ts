import {TextRecord} from './typings'
import {generateElementId} from './utils'

const contentTypeId: string = 'builtin_text'

interface FormData {
  markdown$ja: boolean
  typing$ja: boolean
  text$ja: string
}

export class TextContent {
  id: string
  formData: FormData
  createdBy: string
  createdOn: string
  modifiedOn: string

  constructor(record: TextRecord) {
    this.id = record.id || generateElementId(contentTypeId)
    this.formData = {
      markdown$ja: record.markdown$ja,
      typing$ja: record.typing$ja,
      text$ja: record.text$ja
    }
    this.createdBy = 'admin'
    this.createdOn = '2021-05-05T00:00:00.000Z'
    this.modifiedOn = '2021-05-05T00:00:00.000Z'
  }
}
