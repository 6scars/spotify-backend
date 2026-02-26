import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET


export default async function validateUserSession(req, res, next) {
    const authHeader = extractHeadToken(req);
    if (!authHeader) return res.status(401).json({ error: 'Missing token' });

    const token = authHeader.split(' ')[1];
    try {
        const verifiedToken = jwt.verify(token, JWT_SECRET);
        const DoesTokenExist = checkDoesExist(verifiedToken)

        console.log("DoesTokenExist Token:", DoesTokenExist)
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

// function verifyToken(token){
//     return jwt.verify(token, JWT_SECRET);
// }


////////////////////////////////////////////               ///////////////////////////////////////////////////
/////////////////////////////////////////// IF STATEMENTS ///////////////////////////////////////////////////
//////////////////////////////////////////               ///////////////////////////////////////////////////

function checkDoesExist(token){
    if(token){
        return true
    }else{
        return false;
    }

}