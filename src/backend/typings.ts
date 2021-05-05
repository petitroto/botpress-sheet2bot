import {Intent} from './intent'
import {Qna} from './qna'

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

export interface BotSheet {
  intentQnas: IntentQna[]
}

export interface BotContent {
  qnas: Qna[]
  intents: Intent[]
}
