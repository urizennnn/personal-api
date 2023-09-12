const { CustomAPIErrorHandler } = require('../errors/custom-errors')

function errorHandler(err,req,res,next){
    if(err instanceof CustomAPIErrorHandler){
        return res.status(err.statusCode).json({message:err.message})
    }
    return res.status(404).json({msg:"Something went wrong"})
}

module.exports = errorHandler

