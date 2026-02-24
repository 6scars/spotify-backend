

export default class AppError extends Error{
    constructor(message, status){
        super(message);
        this.status        = status || 500
        this.isOperational = true;
    }
}


export function errorHandler(err, req, res, next) {
  if(process.env.DEVELOPMENT === "YES"){
      console.log(process.env.DEVELOPMENT)
      errorDevelopment(err, res)
    }else{
      errorProduction (err, res)
    } 
}




function errorDevelopment(err, res){
      res.status(err.status).json({
      message: err.message
    });
}

function errorProduction (err, res){
     if(err.status < 500){
        res.status(err.status).json({
          message: err.message
        });
      }
      if(err.status >= 500){
        res.status(500)       .json({
          message: "something goes wrong, try again later or contact with us"
        })
  }
}
