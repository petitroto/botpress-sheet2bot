import * as sdk from 'botpress/sdk'
import multer from 'multer'
import path from 'path'

export default async (bp: typeof sdk) => {

  const diskStorage = multer.diskStorage({
    destination: '/tmp/botpress-sheet2bot-upload',
    filename(req, file, cb) {
      const ext = path.extname(file.originalname)
      cb(undefined, `${new Date().getTime()}${ext}`)
    }
  })
  const upload = multer({storage: diskStorage})

  const router = bp.http.createRouterForBot('sheet2bot')
  router.post(
    '/import',
    upload.single('file'),
    async (req, res) => {
      return res.sendStatus(200)
    })
}
