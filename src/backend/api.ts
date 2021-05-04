import * as sdk from 'botpress/sdk'
import multer from 'multer'
import path from 'path'

import {buildArchive, getTemplate} from './bp-archive'
import {Intent} from './intent'
import load from './load'
import {Qna} from './qna'
import {IntentQna} from './typings'

const mimeTypeOfXlsx = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
const destBasePath = '/tmp/botpress-sheet2bot'

export default async (bp: typeof sdk) => {

  const diskStorage = multer.diskStorage({
    destination: `${destBasePath}/upload`,
    filename(req, file, cb) {
      const ext = path.extname(file.originalname)
      cb(null, `${Date.now()}${ext}`)
    }
  })

  const upload = multer({storage: diskStorage})

  const router = bp.http.createRouterForBot('sheet2bot')

  router.post(
    '/import',
    upload.single('file'),
    async (req, res) => {
      const allowOverwrite = req.body.allowOverwrite === 'true'
      const botId = req.body.botId

      if (!botId) {
        return res.status(400).json({botId, message: 'botId is missing'})
      }

      const existingBot = await bp.bots.getBotById(botId)
      if (!allowOverwrite && existingBot) {
        return res.status(409).json({botId, message: `${botId} already exists`})
      }

      if (req.file.mimetype !== mimeTypeOfXlsx) {
        return res.status(415).json({botId, message: `${req.file.originalname} is not xlsx`})
      }

      // KBファイルの読み込み
      const intentQnas: IntentQna[] = load(bp, req.file.path)

      if (!intentQnas || intentQnas.length === 0) {
        return res.status(406).json({botId, message: `${req.file.originalname} is invalid format`})
      }

      // KBファイルの内容から、Botpressのデータ構造へ組み換え
      const qnas = intentQnas
        .filter(intentQna => intentQna.type === 'qna')
        .map(record => new Qna(record))

      const intents = intentQnas
        .map(record => new Intent(record))

      // テンプレートの読み込み
      const template = getTemplate()

      // ボットアーカイブを生成
      const pathToArchive = path.join(destBasePath, `bot-from-sheet-${Date.now()}`)
      const archive: Buffer = await buildArchive(pathToArchive, template, qnas, intents)

      try {
        await bp.bots.importBot(botId, archive, 'default', allowOverwrite)
        res.status(200).json({botId})
      } catch (err) {
        res.status(500).json({botId})
      }
    })
}
