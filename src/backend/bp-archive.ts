import fs from 'fs'
import path from 'path'
import stream from 'stream'
import tar from 'tar'

const botConfig = {
  locked: false,
  disabled: false,
  private: false,
  details: {},
  $schema: '../../bot.config.schema.json',
  description: '',
  active: true,
  version: '12.20.1',
  author: 'Your Name Here',
  license: 'AGPL-3.0',
  imports: {
    modules: [],
    incomingMiddleware: [],
    outgoingMiddleware: [],
    contentTypes: [
      'builtin_action-button',
      'builtin_card',
      'builtin_carousel',
      'builtin_image',
      'builtin_single-choice',
      'builtin_text',
      'dropdown'
    ]
  },
  dialog: {
    timeoutInterval: '5m'
  },
  logs: {
    expiration: '1 week'
  },
  defaultLanguage: 'ja',
  languages: [
    'ja'
  ],
  id: 'empty',
  name: 'empty',
  pipeline_status: {
    current_stage: {
      id: 'prod',
      promoted_on: '2021-05-05T00:00:00.000Z',
      promoted_by: 'example@example.com'
    }
  }
}

export function buildArchive(pathToArchive, templateFiles, botContent): Promise<Buffer> {

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
  const otherFiles = [{
    name: 'bot.config.json',
    content: JSON.stringify(botConfig)
  }]
  const allFiles = [...templateFiles, ...qnaFiles, ...intentFiles, ...entityFiles, ...otherFiles]

  makeDirs(pathToArchive)
  exportFiles(pathToArchive, allFiles)
  return makeTarball(pathToArchive)
}

function makeDirs(pathToArchive) {
  const dirs = [
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
  dirs.forEach(dir => {
    const fullPath = path.join(pathToArchive, dir)
    fs.mkdirSync(fullPath, {recursive: true})
  })
}

function exportFiles(pathToArchive, allFiles) {
  allFiles.map(file => {
    const filePath = path.join(pathToArchive, file.name)
    fs.writeFileSync(filePath, file.content)
  })
}

async function makeTarball(pathToArchive): Promise<Buffer> {
  const readStream: stream.Readable = tar.c({
    gzip: true,
    C: pathToArchive
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
