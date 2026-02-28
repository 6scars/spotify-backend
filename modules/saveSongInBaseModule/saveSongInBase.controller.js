import fs                       from "fs";
import jwt                      from "jsonwebtoken";
import path                     from "path";
import { createClient }         from '@supabase/supabase-js'
import AppError                 from "../errorHandler/errorHandler.js";
import Queries                  from './saveSongInBase-helper-functions/saveSongInBase.query.js'

export const fsp = fs.promises; // use promises on the existing fs import

export const JWT_SECRET = process.env.JWT_SECRET;
export const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
)

const {insertSongsQuery, insertAuthors_SongsQuery} = Queries


export default async function saveSongInBase(req, res, next) {
    let mp3File, imgFile;
    try {
        // parse addSongForm
        if (!req.body?.addSongForm) {
            throw new AppError('saveSongInBase req.body.addSongForm missing', 500)
        }

        const addSongForm   = JSON.parse(req.body.addSongForm);

        if (!addSongForm.song_name) {
            throw new AppError('saveSongInBase addSongForm.song_name missing', 500)
        }

        // files (names must match router: 'mp3' and 'img')
        mp3File             = req.files?.mp3?.[0];
        imgFile             = req.files?.img?.[0];

        if (!mp3File || !imgFile) {
            throw new AppError('saveSongInBase  req.files?.mp3?  & req.files?.img? missing', 500)
        }

        // read files as buffers using promise API
        const mp3Buffer     = await fsp.readFile(mp3File.path);
        const imgBuffer     = await fsp.readFile(imgFile.path);

        const mp3Name       = path.basename(mp3File.filename);
        const imgName       = path.basename(imgFile.filename);

        // Upload MP3
        
        await uploadFile('spotify', `songs/${mp3Name}`, mp3Buffer, mp3File.mimetype);
        await uploadFile('spotify', `images/songPictures/${imgName}`, imgBuffer, imgFile.mimetype);



        const payloadJWT                        = jwt.verify(req.body.token, JWT_SECRET);
        const { song_name, credit, album_id }   = addSongForm;
        const albumIdValue                      = album_id && album_id !== '' ? album_id : null;

        const insertSongs                       = await insertSongsQuery(song_name, mp3Name, imgName, credit, albumIdValue);

        const song_id                           = insertSongs?.[0]?.id;
        if (!song_id) throw new AppError('Failed to insert song (no id returned)', 500);

        // Insert into authors_songs junction table
        await insertAuthors_SongsQuery(payloadJWT, song_id)

        // success response
        return res.status(201).json({
            message: 'Songs have been uploaded!',
        });
    } catch (err) {
        next(err)
    } finally {
        // Always try to delete local uploads (won't throw due to safeUnlink)
        await safeUnlink(mp3File?.path);
        await safeUnlink(imgFile?.path);
    }
}



    
const safeUnlink = async (p) => {
    try {
        if (!p) return;
        await fsp.unlink(p);
    } catch (err) {
        throw new AppError(err, 500)
    }
};


async function uploadFile(bucketName, pathWithFileName, fileBuffer, fileMimetype){
    try{
        const { data: fileData, error: fileError } = await supabase.storage
        .from(bucketName) // for example: 'spotify'
        .upload(pathWithFileName, fileBuffer, {   //for example: `songs/${filename}`...
            contentType:    fileMimetype,
            upsert:         true
        });

        if(fileError) throw new AppError(fileError.message , 500)
    }catch(err){
        throw new AppError(err.message || 'saveSongInBase.controller error uploadFile - uploading file to supabase', 500)
    }
}