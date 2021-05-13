import * as sdk from 'botpress/sdk'
import fs from 'fs'
import _ from 'lodash'
import path from 'path'
import stream from 'stream'
import tar from 'tar'

import {botConfig} from './bot-config'
import {mergeObjects} from './utils'

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

  constructor(destBasePath) {
    this.pathToArchive = path.join(destBasePath, `bot-from-sheet-${Date.now()}`)
  }

  build(baseFiles: sdk.FileContent[], contentFiles: sdk.FileContent[]): Promise<Buffer> {
    const newFiles = _.differenceBy(contentFiles, baseFiles, 'name')
    const noConflictFiles = _.differenceBy(baseFiles, contentFiles, 'name')
    const conflictBaseFiles = _.intersectionBy(baseFiles, contentFiles, 'name')

    const mergedFiles = conflictBaseFiles.map(baseFile => {
      // コンテントエレメント以外のファイルはマージ不要なのでそのまま
      if (!baseFile.name.match(/^content-elements/)) {
        return baseFile
      }
      // インポートコンテンツにあるコンテントエレメントなら、マージしたファイルにする
      const contentFile = contentFiles.find(file => file.name === baseFile.name)
      const newObjects = JSON.parse(String(contentFile.content))
      const baseObjects = JSON.parse(String(baseFile.content))
      const mergedObjects = mergeObjects(baseObjects, newObjects, 'id')
      return {
        name: baseFile.name,
        content: JSON.stringify(mergedObjects)
      }
    })

    const otherFiles = [
      {
        name: 'bot.config.json',
        content: JSON.stringify(botConfig)
      }
    ]

    const allFiles = [...noConflictFiles, ...mergedFiles, ...newFiles, ...otherFiles]

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
