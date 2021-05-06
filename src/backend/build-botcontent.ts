import {Entity} from './entity'
import {Intent} from './intent'
import {Qna} from './qna'
import {TextContent} from './text-content'
import {BotContent} from './typings'

export function buildBotContent(botSheet): BotContent {
  const qnas = botSheet.intentQnas
    .filter(intentQna => intentQna.type === 'qna')
    .map(record => new Qna(record))

  const intents = botSheet.intentQnas
    .map(record => new Intent(record))

  const entities = botSheet.entities
    .map(record => new Entity(record))

  const textContents = botSheet.textRecords
    .map(record => new TextContent(record))

  return {qnas, intents, entities, textContents}
}
