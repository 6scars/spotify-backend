//process.env.NODE_ENV === "development" - for future


export default class AppError extends Error{
    constructor(message, status){
        super(message);
        this.status = status || 500
        this.isOperational = true;
    }
}


export function errorHandler(err, req, res, next) {
  console.error("ERROR:", err);

  if(err.status >= 400 && err.status < 500){
    res.status(err.status).json({
      message: err.message
    });
  }
  if(err.status >= 500){
    res.status(500).json({
      message: "something goes wrong"
    })
  }
}

