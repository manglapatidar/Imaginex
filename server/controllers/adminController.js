import Post from "../models/postModel.js"
import Report from "../models/reportModel.js"
import User from "../models/userModel.js"

const getAllUsers = async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 })
    if (!users) {
        res.status(404)
        throw new Error("Users Not Found!")
    }
    res.status(200).json(users)
}


const getAllPosts = async (req, res) => {
    const posts = await Post.find().sort({ createdAt: -1 })
    if (!posts) {
        res.status(404)
        throw new Error("Posts Not Found!")
    }
    res.status(200).json(posts)
}



const updatePost = async (req, res) => {
    let postId = req.params.pid

    const post = await Post.findById(postId)

    if (!post) {
        res.status(404)
        throw new Error('Post Not Found!')
    }

    let updatedPost = await Post.findByIdAndUpdate(postId, { isPublished: post.isPublished ? false : true }, { new: true })

    if (!updatedPost) {
        res.status(409)
        throw new Error('Post Not Updated!')
    }
    res.status(200).json(updatedPost)

}



const getReports = async (req, res) => {
    const reports = await Report.find().populate('user').populate('post').sort({ createdAt: -1 })
    if (!reports) {
        res.status(404)
        throw new Error("Reports Not Found!")
    }
    res.status(200).json(reports)

}



const updateUser = async (req, res) => {
    let userId = req.params.uid
    const user = await User.findById(userId)

    if (!user) {
        res.status(404)
        throw new Error('User Not Found!')
    }

    // Prevent banning admins
    if (user.isAdmin) {
        res.status(403)
        throw new Error("Cannot ban an administrator!")
    }

    let updatedUser = await User.findByIdAndUpdate(userId, { isActive: !user.isActive }, { new: true })

    if (!updatedUser) {
        res.status(409)
        throw new Error('User Not Updated!')
    }
    res.status(200).json(updatedUser)
}



const deleteReport = async (req, res) => {
    const reportId = req.params.rid
    const report = await Report.findByIdAndDelete(reportId)

    if (!report) {
        res.status(404)
        throw new Error("Report Not Found!")
    }

    res.status(200).json({ _id: reportId, message: "Report Dismissed" })
}

const deletePost = async (req, res) => {
    const postId = req.params.pid
    const post = await Post.findByIdAndDelete(postId)

    if (!post) {
        res.status(404)
        throw new Error("Post Not Found!")
    }

    // Also delete all reports associated with this post
    await Report.deleteMany({ post: postId })

    res.status(200).json({ _id: postId, message: "Post and associated reports deleted" })
}



const adminController = { getAllPosts, getAllUsers, getReports, updatePost, updateUser, deleteReport, deletePost }
export default adminController