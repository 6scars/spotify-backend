import jwt from 'jsonwebtoken'
import addViewQuery from './addView-helper-functions/addView.helper.addView.query.js'



export default async function addView(req, res, next) {
    try {
        const song_id = extractSongId(req);
        const auth = extractHeadToken(req);
        let user_id = null;
        let token = auth.split(' ')[1];
        token = checkIsTokenNull(token)
    if (token) {
        const verifiedUserData = verifyToken(token);
        console.log(verifiedUserData)
        user_id = verifiedUserData.id
    }
    
        await addViewQuery(song_id, user_id)

        return res.sendStatus(204)
    } catch (err) {
        console.error('FUNCTION ERORR addView', err)
        return res.sendStatus(500);
    }

}

////////////////////////////////////////////                            //////////////////////////////////////////////
/////////////////////////////////////////// HELPERS FOR THE MIDDLEWARE //////////////////////////////////////////////
//////////////////////////////////////////                            //////////////////////////////////////////////
function extractSongId(req){
    return req.body.song_id
}

function extractHeadToken(req){
    return req.headers.authorization;
}

function verifyToken(token){
    return jwt.verify(token, JWT_SECRET);
}



////////////////////////////////////////////               ///////////////////////////////////////////////////
/////////////////////////////////////////// IF STATEMENTS ///////////////////////////////////////////////////
//////////////////////////////////////////               ///////////////////////////////////////////////////


function checkIsTokenNull(token){
    if (token === 'null' || !token) {
        token = null;
        return token
    }
}

