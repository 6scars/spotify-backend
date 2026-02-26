import express                    from 'express';
import multer                     from 'multer';
import controller                 from '../controllers/controller.js';
import verifyToken                from '../middleware/verifyToken.middleware.js'
import signInRouter               from "../signInModule/signIn.router.js"
import signUpRouter               from "../signUpModule/signUp.router.js"
import playlistsRouter            from "../playlistsModule/playlists.router.js"
import validateUserSessionRouter  from '../validateUserSessionModule/validateUserSession.router.js'
import getUserRouter              from '../getSongs/getSongs.router.js'
import path                       from 'path';

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


router.use(signInRouter);
router.use(signUpRouter);
router.use(playlistsRouter);
router.use(validateUserSessionRouter);
router.use(getUserRouter);
router.post('/addView', controller.addView)
router.get('/getAuthorsAlbums', verifyToken, controller.getAuthorsAlbums)
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
router.post('/addSongToPlaylist',verifyToken, controller.addSongToPlaylist)
router.post('/handleRemoveSong',verifyToken, controller.handleRemoveSong)
export default router;