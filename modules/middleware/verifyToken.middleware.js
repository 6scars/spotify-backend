import AppError                     from "../errorHandler/errorHandler.js";
import jwtVerifyReturnPayload       from "../helper-functions/jwtVerifyReturnPayload.js";

/* returns    PAYLOAD   of   JWT TOKEN   if is  VALID */
export default function verifyToken(req, res, next) {
    try {
        const authHeader    = returnAuthHeader(req);

        checkIsAuthHeaderExist(authHeader);

        const token         = extractToken(authHeader)
        const payloadJWT    = jwtVerifyReturnPayload(token)

        req.payloadJWT      = payloadJWT;
        next()
    } catch (err) {
        next(err)
    }
}


function extractToken(authHeader){
    try{
        if(authHeader){
            return authHeader.split(' ')[1];
        }
    }catch(err){
        throw new AppError("There is no authHeader", 500)
    }
}

function returnAuthHeader(req){
    try{
        if(req.headers.authorization){
            return req.headers.authorization;
        }
    }catch(err)
    {
        throw new AppError("There is authorization header object", 500)
    }
    
}

function checkIsAuthHeaderExist(authHeader){
    if (!authHeader) 
        throw new AppError("Your session ended", 400)
}

