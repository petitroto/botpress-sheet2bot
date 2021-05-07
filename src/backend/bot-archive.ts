import fs from 'fs'
import path from 'path'
import stream from 'stream'
import tar from 'tar'

export class BotArchive {
  dirs = [
    'actions',
    'content-elements',
    'entities',
    'flows/skills',
    'hooks',
    'hooks/before_incoming_middleware',
    'hooks/after_incoming_middleware',
    'hooks/before_outgoing_middleware',
    'hooks/after_event_processed',
    'hooks/before_suggestions_election',
    'hooks/before_session_timeout',
    'hooks/after_bot_mount',
    'hooks/after_bot_unmount',
    'hooks/before_bot_import',
    'hooks/after_server_start',
    'intents',
    'media',
    'qna'
  ]
  pathToArchive: string

  constructor(pathToArchive) {
    this.pathToArchive = pathToArchive
  }

  build(templateFiles, botContent, botConfig): Promise<Buffer> {

    const qnaFiles = botContent.qnas.map(qna => ({
      name: `qna/${qna.id}.json`,
      content: JSON.stringify(qna)
    }))
    const intentFiles = botContent.intents.map(intent => ({
      name: `intents/${intent.name}.json`,
      content: JSON.stringify(intent)
    }))
    const entityFiles = botContent.entities.map(entity => ({
      name: `entities/${entity.name}.json`,
      content: JSON.stringify(entity)
    }))
    const otherFiles = [
      {
        name: 'content-elements/builtin_text.json',
        content: JSON.stringify(botContent.textContents)
      },
      {
        name: 'bot.config.json',
        content: JSON.stringify(botConfig)
      }
    ]
    const allFiles = [...templateFiles, ...qnaFiles, ...intentFiles, ...entityFiles, ...otherFiles]

    this.makeDirs()
    this.exportFiles(allFiles)
    return this.makeTarball()
  }

  private makeDirs() {
    this.dirs.forEach(dir => {
      const fullPath = path.join(this.pathToArchive, dir)
      fs.mkdirSync(fullPath, {recursive: true})
    })
  }

  private exportFiles(allFiles) {
    allFiles.map(file => {
      const filePath = path.join(this.pathToArchive, file.name)
      fs.writeFileSync(filePath, file.content)
    })
  }

  private async makeTarball(): Promise<Buffer> {
    const readStream: stream.Readable = tar.c({
      gzip: true,
      C: this.pathToArchive
    }, ['.'])

    return new Promise((resolve, reject) => {
      const buffers = []
      readStream.on('data', data => {
        buffers.push(data)
      })
      readStream.on('end', () => {
        const result = Buffer.concat(buffers)
        resolve(result)
      })
      readStream.on('error', error => {
        reject(error)
      })
    })
  }
}
