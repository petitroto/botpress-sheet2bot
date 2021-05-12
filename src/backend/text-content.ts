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

  constructor(raw: Partial<TextContent>) {
    Object.assign(this, raw)
  }

  static fromRecord(record: TextRecord): TextContent {
    const raw: any = {}
    raw.id = record.id || generateElementId(contentTypeId)
    raw.formData = {
      markdown$ja: record.markdown$ja,
      typing$ja: record.typing$ja,
      text$ja: record.text$ja
    }
    raw.createdBy = 'admin'
    raw.createdOn = '2021-05-05T00:00:00.000Z'
    raw.modifiedOn = '2021-05-05T00:00:00.000Z'
    return new TextContent(raw)
  }

  toRecord(): TextRecord {
    return {
      id: this.id,
      markdown$ja: this.formData.markdown$ja,
      typing$ja: this.formData.typing$ja,
      text$ja: this.formData.text$ja
    } as TextRecord
  }
}
