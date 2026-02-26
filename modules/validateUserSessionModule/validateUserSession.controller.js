import jwt from 'jsonwebtoken'


export default async function validateUserSession(req, res, next) {
    const authHeader = extractHeadToken(req);
    if (!authHeader) return res.status(401).json({ error: 'Missing token' });

    const token = authHeader.split(' ')[1];
    try {
        const verifiedToken = verifyToken(token);
        const DoesTokenExist = checkDoesExist(verifiedToken)

        if(DoesTokenExist){
            return res.status(201).json({ message: "accomplished", token: token })
        }

        return res.status(401).json({ message: 'NOT VALID TOKEN' })
    } catch (err) {
        console.error('NOT VALID TOKEN')
        return res.status(401).json({ message: 'NOT VALID TOKEN' })
    }
}


////////////////////////////////////////////                            //////////////////////////////////////////////
/////////////////////////////////////////// HELPERS FOR THE MIDDLEWARE //////////////////////////////////////////////
//////////////////////////////////////////                            //////////////////////////////////////////////


function extractHeadToken(req){
    return req.headers.authorization;
}

function verifyToken(token){
    return jwt.verify(token, JWT_SECRET);
}


////////////////////////////////////////////               ///////////////////////////////////////////////////
/////////////////////////////////////////// IF STATEMENTS ///////////////////////////////////////////////////
//////////////////////////////////////////               ///////////////////////////////////////////////////

function checkDoesExist(token){
    if(token){
        return true;
    }
    return false

}