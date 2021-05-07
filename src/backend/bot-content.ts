import {ChoiceContent} from './choice-content'
import {Entity} from './entity'
import {Intent} from './intent'
import {Qna} from './qna'
import {TextContent} from './text-content'

export class BotContent {
  qnas: Qna[]
  intents: Intent[]
  entities: Entity[]
  textContents: TextContent[]
  choiceContents: ChoiceContent[]

  constructor(qnas, intents, entities, textContents, choiceContents) {
    this.qnas = qnas
    this.intents = intents
    this.entities = entities
    this.textContents = textContents
    this.choiceContents = choiceContents
  }

  static fromBotSheet(botSheet): BotContent {
    const qnas = botSheet.intentQnas
      .filter(intentQna => intentQna.type === 'qna')
      .map(record => new Qna(record))

    const intents = botSheet.intentQnas
      .map(record => new Intent(record))

    const entities = botSheet.entities
      .map(record => new Entity(record))

    const textContents = botSheet.textRecords
      .map(record => new TextContent(record))

    const choiceContents = botSheet.choiceRecords
      .map(record => new ChoiceContent(record))

    return new BotContent(qnas, intents, entities, textContents, choiceContents)
  }
}
