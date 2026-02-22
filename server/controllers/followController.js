import User from "../models/userModel.js"

const followUserRequest = async (req, res) => {


    let targetUser = await User.findById(req.params.uid) //jisko follow krna hai
    let currentUser = await User.findById(req.user._id) // jo follow karega

    // Check if both user exists
    if (!targetUser || !currentUser) {
        res.status(404)
        throw new Error("User Not Found!")
    }

    // Add Follower
    targetUser.followers.push(currentUser._id)
    await targetUser.save()

    
    res.status(200).json(targetUser).select("-password")

}

const followController = { followUserRequest }

export default followController