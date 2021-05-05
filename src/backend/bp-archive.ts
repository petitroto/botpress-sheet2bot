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

export function buildArchive(pathToArchive, templateFiles, qnas, intents): Promise<Buffer> {

  const qnaFiles = qnas.map(qna => ({name: `qna/${qna.id}.json`, content: JSON.stringify(qna)}))
  const intentFiles = intents.map(intent => ({name: `intents/${intent.name}.json`, content: JSON.stringify(intent)}))
  const otherFiles = [{name: 'bot.config.json', content: JSON.stringify(botConfig)}]
  const allFiles = [...templateFiles, ...qnaFiles, ...intentFiles, ...otherFiles]

  makeDirs(pathToArchive)
  exportFiles(pathToArchive, allFiles)
  return makeTarball(pathToArchive)
}

function makeDirs(pathToArchive) {
  const dirs = [
    'content-elements',
    'hooks',
    'qna',
    'actions',
    'intents',
    'flows/skills',
    'media'
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
