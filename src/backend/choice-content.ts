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

  constructor(record: ChoiceRecord) {
    this.id = record.id || generateElementId(contentTypeId)
    this.formData = {
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
    this.createdBy = 'admin'
    this.createdOn = '2021-05-05T00:00:00.000Z'
    this.modifiedOn = '2021-05-05T00:00:00.000Z'
  }
}
