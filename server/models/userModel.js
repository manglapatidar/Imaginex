import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true , "Please Enter Your Name"]
    },
    email : {
        type : String,
        required : [true , "Please Enter Your Email"],
        unique : true
    },
    password : {
        type : String,
        required : [true , "Please Enter Your Password"],
        
    },
    isAdmin : {
        type : Boolean,
        default : false,
        required : true

    },
    isActive : {
        type : String,
        default : true ,
        required : true
    },
    credits : {
        type : Number,
        default : 5,
        required : true
    }

},{
    timestamps : true
})

const user = mongoose.model('User', userSchema)

export default user