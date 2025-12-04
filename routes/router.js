import express from 'express';
import multer from 'multer';
import controller from '../controllers/controller.js';
import path from 'path';

const router = express.Router();
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
const upload = multer({ storage }); // note: dest, not desc



router.post("/newAccount", controller.signUp)
router.post('/signin', controller.signIn)
router.post('/playlists', controller.playlists)
router.post('/checkToken', controller.checkToken)
router.get('/fetchSongs', controller.fetchSongs)
router.post('/addView', controller.addView)
router.get('/getAuthorsAlbums', controller.getDataFromToken, controller.getAuthorsAlbums)
router.post(
  '/saveSongInBase',
  upload.fields([
    { name: 'mp3', maxCount: 1 },
    { name: 'img', maxCount: 1 }
  ]),
  controller.saveSongInBase
);

router.post('/createPlaylist',controller.createPlaylist)
router.get('/getPlaylistData',controller.getPlaylistData)
router.get('/getSong',controller.getSong);
router.post('/addSongToPlaylist',controller.verifyToken, controller.addSongToPlaylist)
router.post('/handleRemoveSong',controller.verifyToken, controller.handleRemoveSong)
export default router;