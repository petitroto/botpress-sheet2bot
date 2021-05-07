export interface IntentQna {
  type: string
  action: string
  context1: string
  enabled: boolean
  question1: string
  question2: string
  question3: string
  question4: string
  question5: string
  answer1: string
  redirectFlow: string
  redirectNode: string
}

export interface EntityRecord {
  id: string
  name: string
  sensitive: boolean
  type: string
  occur1: string
  occur1_1: string
  occur1_2: string
  occur1_3: string
  occur2: string
  occur2_1: string
  occur2_2: string
  occur2_3: string
  fuzzy: number
  pattern: string
  ex1: string
  ex2: string
  ex3: string
  matchCase: boolean
}

export interface TextRecord {
  id: string
  markdown$ja: boolean
  typing$ja: boolean
  text$ja: string
}

export interface ChoiceRecord {
  id: string
  markdown$ja: boolean
  typing$ja: boolean
  disableFreeText$ja: boolean
  text$ja: string
  dropdownPlaceholder$ja: string
  choice1_title: string
  choice1_value: string
  choice2_title: string
  choice2_value: string
  choice3_title: string
  choice3_value: string
  choice4_title: string
  choice4_value: string
}
