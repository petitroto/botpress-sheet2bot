import _ from 'lodash'
import {ChoiceRecord} from './typings'
import {generateElementId, range} from './utils'

const contentTypeId: string = 'builtin_single-choice'

interface FormData {
  markdown$ja: boolean
  typing$ja: boolean
  disableFreeText$ja: boolean
  text$ja: string
  dropdownPlaceholder$ja: string
  choices$ja: ChoiceOption[]
}

interface ChoiceOption {
  title: string
  value: string
}

export class ChoiceContent {
  id: string
  formData: FormData
  createdBy: string
  createdOn: string
  modifiedOn: string

  constructor(raw: Partial<ChoiceContent>) {
    Object.assign(this, raw)
  }

  static fromRecord(record: ChoiceRecord): ChoiceContent {
    const raw: any = {}
    raw.id = record.id || generateElementId(contentTypeId)
    raw.formData = {
      markdown$ja: record.markdown$ja,
      typing$ja: record.typing$ja,
      disableFreeText$ja: record.disableFreeText$ja,
      text$ja: record.text$ja,
      dropdownPlaceholder$ja: record.dropdownPlaceholder$ja,
      choices$ja: _.chain([...range(1, 11)])
        .map(index => ({
          title: record[`choice${index}_title`],
          value: record[`choice${index}_value`]
        }))
        .filter(option => option.title != null)
        .value()
    }
    raw.createdBy = 'admin'
    raw.createdOn = '2021-05-05T00:00:00.000Z'
    raw.modifiedOn = '2021-05-05T00:00:00.000Z'
    return new ChoiceContent(raw)
  }

  toRecord(): ChoiceRecord {
    const choices = this.formData.choices$ja
      .reduce((memo, choice, index) => {
        memo[`choice${index + 1}_title`] = choice.title
        memo[`choice${index + 1}_value`] = choice.value
        return memo
      }, {})

    return {
      id: this.id,
      markdown$ja: this.formData.markdown$ja,
      typing$ja: this.formData.typing$ja,
      text$ja: this.formData.text$ja,
      disableFreeText$ja: this.formData.disableFreeText$ja,
      dropdownPlaceholder$ja: this.formData.dropdownPlaceholder$ja,
      ...choices
    } as ChoiceRecord
  }
}
