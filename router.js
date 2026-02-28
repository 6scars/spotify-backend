import express                    from 'express';
import signInRouter               from "./modules/signInModule/signIn.router.js";
import signUpRouter               from "./modules/signUpModule/signUp.router.js";
import playlistsRouter            from "./modules/playlistsModule/playlists.router.js";
import validateUserSessionRouter  from './modules/validateUserSessionModule/validateUserSession.router.js';
import getUserRouter              from './modules/getSongsModule/getSongs.router.js'
import addViewRouter              from './modules/addViewModule/addVIew.router.js';
import getAuthorsAlbumsRouter     from './modules/getAuthorsAlbumsModule/getAuthorsAlbums.router.js';
import saveSongInBaseRouter       from './modules/saveSongInBaseModule/saveSongInBase.router.js';
import createPlaylistRouter       from './modules/createPlaylistModule/createPlaylist.router.js';   
import getPlaylistsRouter         from './modules/getPlaylistsModule/getPlaylists.router.js'; 
import getSongRouter              from './modules/getSongModule/getSong.router.js';
import addSongToPlaylistRouter    from './modules/addSongIntoPlaylistModule/addSongIntoPlaylist.router.js';
import handleRemoveSongRouter     from './modules/handleRemoveSong/handleRemoveSong.router.js';

const router = express.Router();



router.use(signInRouter                 );
router.use(signUpRouter                 );
router.use(playlistsRouter              );
router.use(validateUserSessionRouter    );
router.use(getUserRouter                );
router.use(addViewRouter                );
router.use(getAuthorsAlbumsRouter       );
router.use(saveSongInBaseRouter         );
router.use(createPlaylistRouter         );
router.use(getPlaylistsRouter           );
router.use(getSongRouter                );
router.use(addSongToPlaylistRouter      );
router.use(handleRemoveSongRouter       );




export default router;