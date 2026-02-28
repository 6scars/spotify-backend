import express                    from 'express';
import signInRouter               from "../signInModule/signIn.router.js";
import signUpRouter               from "../signUpModule/signUp.router.js";
import playlistsRouter            from "../playlistsModule/playlists.router.js";
import validateUserSessionRouter  from '../validateUserSessionModule/validateUserSession.router.js';
import getUserRouter              from '../getSongsModule/getSongs.router.js'
import addViewRouter              from '../addViewModule/addVIew.router.js';
import getAuthorsAlbumsRouter     from '../getAuthorsAlbumsModule/getAuthorsAlbums.router.js';
import saveSongInBaseRouter       from '../saveSongInBaseModule/saveSongInBase.router.js';
import createPlaylistRouter       from '../createPlaylistModule/createPlaylist.router.js';   
import getPlaylistsRouter         from '../getPlaylistsModule/getPlaylists.router.js'; 
import getSongRouter              from '../getSongModule/getSong.router.js';
import addSongToPlaylistRouter    from '../addSongIntoPlaylistModule/addSongIntoPlaylist.router.js';
import handleRemoveSongRouter     from '../handleRemoveSong/handleRemoveSong.router.js';

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