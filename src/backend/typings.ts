import {Entity} from './entity'
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

export interface BotSheet {
  intentQnas: IntentQna[]
  entities: EntityRecord[]
}

export interface BotContent {
  qnas: Qna[]
  intents: Intent[]
  entities: Entity[]
}
