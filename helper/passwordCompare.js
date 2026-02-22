import bcrypt from "bcrypt"

export default async function passwordCompare(password, userPassword){
    try{
        return await bcrypt.compare(password, userPassword);
    }catch(err){
        console.error("passwordCompare", error);
        throw err;
    }
    
}
