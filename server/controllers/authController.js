import bcrypt from "bcryptjs";

import User from "../models/userModel.js"
const registerUser = async (req, res) => {

    const { name, email, phone, password } = req.body


    // Check if all fields are coming
    if (!name || !email || !phone || !password) {

        res.status(409)
        throw new Error('Please Fill All Details!')
    }


    // Check if user already exists
    let emailExist = await User.findOne({ email: email })
    let phoneExist = await User.findOne({ phone: phone })

    if (emailExist || phoneExist) {
        res.status(409)
        throw new Error("User Already Exists!")
    }
    // Hash Password

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);



    //Register User
    let user = await User.create({ name, email, phone, password: hashedPassword })

    if (!user) {
        res.status(400)
        throw new Error("User Not Created!")
    }

    res.status(201).json(user)

}

const loginUser = async (req, res) => {
    const { email, password } = req.body


    // Check if all fields are coming
    if (!email || !password) {

        res.status(409)
        throw new Error('Please Fill All Details!')
    }

    //Check if user exists
    let user = await User.findOne({ email: email })
    if (user && await bcrypt.compare(password, user.password)) {
        res.status(200).json(user)
    } else {
        res.status(400)
        throw new Error("Invalid Credentials!")
    }
}




const authController = { registerUser, loginUser }
export default authController