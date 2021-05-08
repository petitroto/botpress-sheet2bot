import * as sdk from 'botpress/sdk'
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

  toContentFiles(): sdk.FileContent[] {
    const qnaFiles = this.qnas.map(qna => ({
      name: `qna/${qna.id}.json`,
      content: JSON.stringify(qna)
    }))
    const intentFiles = this.intents.map(intent => ({
      name: `intents/${intent.name}.json`,
      content: JSON.stringify(intent)
    }))
    const entityFiles = this.entities.map(entity => ({
      name: `entities/${entity.name}.json`,
      content: JSON.stringify(entity)
    }))
    const otherFiles = [
      {
        name: 'content-elements/builtin_text.json',
        content: JSON.stringify(this.textContents)
      },
      {
        name: 'content-elements/builtin_single-choice.json',
        content: JSON.stringify(this.choiceContents)
      }
    ]

    return [...qnaFiles, ...intentFiles, ...entityFiles, ...otherFiles]
  }
}
