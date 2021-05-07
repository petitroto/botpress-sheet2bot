import * as sdk from 'botpress/sdk'
import multer from 'multer'
import path from 'path'

import {BotArchive} from './bot-archive'
import {botConfig} from './bot-config'
import {BotContent} from './bot-content'
import {BotSheet} from './bot-sheet'

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

      // 各種エラーチェック
      if (!botId) {
        return res.status(400).json({botId, message: 'botId is missing'})
      }
      const existingBot = await bp.bots.getBotById(botId)
      if (!allowOverwrite && existingBot) {
        return res.status(409).json({botId, message: 'Requested botId already exists'})
      }
      if (req.file.mimetype !== mimeTypeOfXlsx) {
        return res.status(415).json({botId, message: 'Uploaded file is not xlsx'})
      }

      // ボットシートの読み込み
      const botSheet: BotSheet = BotSheet.fromFile(req.file.path)
      if (!botSheet) {
        return res.status(406).json({botId, message: 'Uploaded file is invalid format'})
      }

      // ボットシートの内容から、Botpressのデータ構造へ組み換え
      const botContent = BotContent.fromBotSheet(botSheet)

      // テンプレートの読み込み
      const templateFiles = await bp.bots.getBotTemplate('sheet2bot', 'qna-with-fallback')

      // ボットアーカイブを生成
      const pathToArchive = path.join(destBasePath, `bot-from-sheet-${Date.now()}`)
      const botArchive = new BotArchive(pathToArchive)
      const archive: Buffer = await botArchive.build(templateFiles, botContent, botConfig)

      // インポート
      try {
        await bp.bots.importBot(botId, archive, 'default', allowOverwrite)
        res.status(200).json({botId, message: 'Imported successfully'})
      } catch (err) {
        res.status(500).json({botId, message: 'Failed to import'})
      }
    })

  // /s/sheet2bot でアクセス可能にする
  createShortLink(bp)
}


function createShortLink(bp) {
  const params = {
    m: 'sheet2bot',
    v: 'AppView'
  }
  bp.http.createShortLink('sheet2bot', `${process.EXTERNAL_URL}/lite/`, params)
}
