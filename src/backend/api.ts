import axios from 'axios'
import * as sdk from 'botpress/sdk'
import {BPRequest} from 'common/http'
import multer from 'multer'
import path from 'path'

import {BotArchive} from './bot-archive'
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
      const overwriteExistingBot = req.body.allowOverwrite === 'true'
      const botId = req.body.botId
      const templateId = req.body.templateId
      const templateModuleId = req.body.templateModuleId

      // 各種エラーチェック
      if (!botId) {
        return res.status(400).json({botId, message: 'botId is missing'})
      }
      const existingBot = await bp.bots.getBotById(botId)
      if (!overwriteExistingBot && existingBot) {
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
      const contentFiles = botContent.toContentFiles()

      // ベースにするボットアーカイブを取得（既存ボット or テンプレート）
      const baseFiles = await (async () => {
        if (overwriteExistingBot) {
          const existingBotArchive = await bp.bots.exportBot(botId)
          return BotArchive.convertTgzToFileContents(existingBotArchive)
        } else {
          return bp.bots.getBotTemplate(templateModuleId, templateId)
        }
      })()

      // ボットアーカイブを生成
      const botArchive = new BotArchive(destBasePath)
      const archive: Buffer = await botArchive.build(baseFiles, contentFiles, overwriteExistingBot)

      // インポート
      try {
        await bp.bots.importBot(botId, archive, 'default', overwriteExistingBot)
        res.status(200).json({botId, message: 'Imported successfully'})
      } catch (err) {
        res.status(500).json({botId, message: 'Failed to import'})
      }
    }
  )

  router.get(
    '/export',
    async (req, res) => {
      const botId = req.params.botId

      const ghost = bp.ghost.forBot(botId)
      const botContent = await BotContent.fromGhost(ghost)

      const botSheet: BotSheet = BotSheet.fromContent(botContent)

      const xlsxFileBuffer = botSheet.toFile()

      res.writeHead(200, {
        'Content-Type': mimeTypeOfXlsx,
        'Content-Disposition': `attachment; filename=botsheet_${botId}_${Date.now()}.xlsx`,
        'Content-Length': xlsxFileBuffer.length
      })
      res.end(xlsxFileBuffer)
    }
  )

  router.get(
    '/listBotTemplate',
    async (req: BPRequest, res) => {

      const {data} = await axios.get('/admin/workspace/bots/templates', {
        baseURL: `${process.LOCAL_URL}/api/v1`,
        headers: {
          Authorization: req.headers.authorization,
          'X-BP-Workspace': req.workspace
        }
      })

      res.status(200).json({templates: data})
    }
  )

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
