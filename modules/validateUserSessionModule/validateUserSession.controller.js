import jwt from 'jsonwebtoken'
import AppError from '../errorHandler/errorHandler.js'
const JWT_SECRET = process.env.JWT_SECRET


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
        throw new AppError("validateUserSession - Token doesnt exist", 500);
    } catch (err) {
        next(err)
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
        return true
    }else{
        return false;
    }

}