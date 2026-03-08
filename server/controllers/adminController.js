import User from "../models/userModel.js"

const getAllUsers = async (req, res) => {
    const users = await User.find()
    if (!users) {
        res.status(404)
        throw new Error("Users Not Found!")
    }
    res.status(200).json(users)
}


const getAllPosts = async (req, res) => {
    res.send("All Posts")

}
const updatePost = async (req, res) => {
    res.send(" Post Updated")

}
const getReports = async (req, res) => {
    res.send("Get Reports!")

}
const updateUser = async (req, res) => {

    let userId = req.params.uid
    const user = await User.findById(userId)

    if (!user) {
        res.status(404)
        throw new Error('User Not Found!')
    }

    let updatedUser = await User.findByIdAndUpdate(userId, { isActive: user.isActive ? false : true }, { new: true })

    if (!updateUser) {
        res.status(409)
        throw new Error('User Not Updated!')
    }
    res.status(200).json(updatedUser)
}

const adminController = { getAllPosts, getAllUsers, getReports, updatePost, updateUser }
export default adminController