import { sql }              from '../config/db.js'
import passwordCompare      from '../helper/passwordCompare.js';
import createToken          from '../helper/createToken.js';
import AppError             from './errorHandler.js';

export async function signIn(req, res, next) {
    const { email, password } = req.body;
    try {
        checkIsEmailAndPassword(email, password)

        const data =  await getUserByEmail(email)
        checkIsReturnedUserData(data)

        const { id: userId, password: userPassword, email: userEmail} = data[0];
        checkIsNoEmpty(userId, userPassword, userEmail)

        const isMatch = await passwordCompare(password, userPassword);
        checkIsMatchExist(isMatch)

        const token = await createToken(userId, userEmail);
        checkIsTokenExist(token)


        return res.status(200).json({ message: 'logedIn', user_id: userId, token })
    } catch (err) {
        next(err)
    }
}


function checkIsEmailAndPassword(email, password){
    if(!email || !password) {
        return new AppError("No email or password", 400)
    };
}

function checkIsReturnedUserData(data){
    if(!data || data.length === 0) {
        throw new AppError("Invalid email or password", 400); 
    }
}

function checkIsNoEmpty(userId, userPassword, userEmail){
    if(!userId || !userPassword || !userEmail) {
        throw new AppError("Invalid user data from database", 500)
    }
}

function checkIsMatchExist(isMatch){
    if(!isMatch){
        throw new AppError("Invalid email or password", 400)
    }
}

function checkIsTokenExist(token){
    if(!token){
        throw new AppError("There is not createdtoken", 500)
    }
}




async function getUserByEmail(email){
    try{
        const data = await sql`
                SELECT id, email, password
                FROM authors
                WHERE authors.email = ${email}
            `;

        return data;
    }catch(err){
        throw new AppError(err.message || "singIn querry error", err.status || 500);
    }

}



export default signIn;