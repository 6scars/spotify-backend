import AppError                 from "../../../../config/errorHandler/errorHandler.js";
import { sql }                  from "../../../../config/db.js";

async function insertSongsQuery(song_name, mp3Name, imgName, credit, albumIdValue){
    try{
        const insertSongs = await sql`
            INSERT INTO songs ("song_Name", file, "song_Image", credit, album_id)
            VALUES (${song_name}, ${mp3Name}, ${imgName}, ${credit}, ${albumIdValue})
            RETURNING id;
            `;
        return insertSongs;    
    }catch(err){
        throw new AppError(err.message || 'saveSongsInBase.controller insertSongsQuery error', 500)
    }
}

async function insertAuthors_SongsQuery(payloadJWT, song_id){
    try{
        const response = await sql`
            INSERT INTO authors_songs (author_id, song_id)
            VALUES (${payloadJWT.id}, ${song_id});
        `;
    }catch(err){
        throw new AppError(err.message || "saveSongsInBase.controller insertAuthors_songsQuery error", 500)
    }

}


let Queries;
export default Queries = {
    insertSongsQuery,
    insertAuthors_SongsQuery
}