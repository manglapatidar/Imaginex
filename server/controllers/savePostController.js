import Post from "../models/postModel.js"
import Saved from "../models/savedPostModel.js"

// Toggle Save Post
const toggleSavePost = async (req, res) => {
    const userId = req.user._id
    const postId = req.params.pid

    //Check If Posts Exist
    const post = await Post.findById(postId)


    if (!post) {
        res.status(404)
        throw new Error("Post Not Found!")
    }



    // Check if post is already saved
    const saveExists = await Saved.findOne({user : userId, post: postId})
    if(saveExists){
        await Saved.findByIdAndDelete(saveExists._id)
        res.status(200).json({ msg: "Post removed from collections", saved: false })
        return
    }

    // Create Save Post
    const savedPost = new Saved({
        user: userId,
        post: postId
    })


    await savedPost.save()
    // await savedPost.populate('post')


    if (!savedPost) {
        res.status(409)
        throw new Error("Post Not Saved!")
    }
    res.status(201).json({ msg: "Post Saved", saved: true, savedPost})
}



// Get Save Post
const getSavePosts = async (req, res) => {

    const userId = req.user._id
    const allMySavedPosts = await Saved.find({ user: userId}).populate('post')
    
    if(!allMySavedPosts){
        res.status(404)
        throw new Error("Saved Posts Not Found!")
    }
    res.status(200).json(allMySavedPosts)
}

// Delete Saved Posts
const removedSavedPost = async(req, res) => {

await Saved.findOneAndDelete({_id: req.params.pid, user: req.user._id})
res.status(200).json({
    _id : req.params.pid,
    msg : "Saved Post Removed"
})
}



const savePostController = { toggleSavePost, getSavePosts , removedSavedPost }

export default savePostController