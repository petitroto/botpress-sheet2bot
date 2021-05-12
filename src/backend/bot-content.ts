import * as sdk from 'botpress/sdk'
import {ChoiceContent} from './choice-content'
import {Entity} from './entity'
import {Intent} from './intent'
import {Qna} from './qna'
import {TextContent} from './text-content'
import {flatMap} from './utils'

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
    const qnas = botSheet.qnaRecords
      .map(record => Qna.fromRecord(record))

    const intents = botSheet.intentRecords
      .map(record => Intent.fromRecord(record))

    const entities = botSheet.entityRecords
      .map(record => Entity.fromRecord(record))

    const textContents = botSheet.textRecords
      .map(record => TextContent.fromRecord(record))

    const choiceContents = botSheet.choiceRecords
      .map(record => ChoiceContent.fromRecord(record))

    return new BotContent(qnas, intents, entities, textContents, choiceContents)
  }

  static async fromGhost(ghost): Promise<BotContent> {

    const getObjectsInFolder = async (folder: string): Promise<Array<any>> => {
      const names = await ghost.directoryListing(folder, '*.json')
      return Promise.all(names.map(name => ghost.readFileAsObject(folder, name)))
    }

    const rawQnas = await getObjectsInFolder('qna')
    const qnas = rawQnas.map(raw => new Qna(raw))

    const rawIntents = await getObjectsInFolder('intents')
    const intents = flatMap(rawIntents, raw => !raw.name.match(/^__qna__/) ? [new Intent(raw)] : [])

    const rawentities = await getObjectsInFolder('entities')
    const entities = rawentities.map(raw => new Entity(raw))

    const rawTextContents = await ghost.readFileAsObject('content-elements', 'builtin_text.json')
    const textContents = rawTextContents.map(raw => new TextContent(raw))
    const rawChoiceContents = await ghost.readFileAsObject('content-elements', 'builtin_single-choice.json')
    const choiceContents = rawChoiceContents.map(raw => new ChoiceContent(raw))

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
