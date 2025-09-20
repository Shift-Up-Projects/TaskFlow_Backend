const mongoose = require("mongoose")

module.exports = async () => {
    try{    
        await mongoose.connect(process.env.MONGO_URL)
        console.log('Connected To MongoDB ^_^' .cyan.underline)
    }catch(error){
        console.log('Connection Failed To MongoDB! ):' .red.bold , error)
    }
}