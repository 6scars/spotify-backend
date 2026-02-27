import express  from 'express'
import multer   from 'multer'
import path     from 'path'
import fs       from 'fs'
import saveSongInBase from './saveSongInBase.controller.js'

const uploadDir = 'uploads'

if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, {recursive: true})
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname)
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}-${Date.now()}${ext}`)
  }
})
const upload = multer({ storage });

const router = express.Router();

router.post(
    '/saveSongInBase',
    upload.fields([
        { name: 'mp3', maxCount:1},
        { name: 'img', maxCount:1}
    ]),
    saveSongInBase
)



export default router