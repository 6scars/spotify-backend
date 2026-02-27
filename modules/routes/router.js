import express                    from 'express';
import controller                 from '../controllers/controller.js';
import verifyToken                from '../middleware/verifyToken.middleware.js'
import signInRouter               from "../signInModule/signIn.router.js"
import signUpRouter               from "../signUpModule/signUp.router.js"
import playlistsRouter            from "../playlistsModule/playlists.router.js"
import validateUserSessionRouter  from '../validateUserSessionModule/validateUserSession.router.js'
import getUserRouter              from '../getSongsModule/getSongs.router.js'
import addViewRouter              from '../addViewModule/addVIew.router.js';
import getAuthorsAlbumsRouter     from '../getAuthorsAlbums/getAuthorsAlbums.router.js'
import saveSongInBaseRouter       from '../saveSongInBaseModule/saveSongInBase.router.js'
import path                       from 'path';

const router = express.Router();



router.use(signInRouter);
router.use(signUpRouter);
router.use(playlistsRouter);
router.use(validateUserSessionRouter);
router.use(getUserRouter);
router.use(addViewRouter)
router.use(getAuthorsAlbumsRouter)
router.use(saveSongInBaseRouter)
router.post('/createPlaylist',controller.createPlaylist)
router.get('/getPlaylistData',controller.getPlaylistData)
router.get('/getSong',controller.getSong);
router.post('/addSongToPlaylist',verifyToken, controller.addSongToPlaylist)
router.post('/handleRemoveSong',verifyToken, controller.handleRemoveSong)
export default router;