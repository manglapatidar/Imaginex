import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import uploadToCloudinary from "../middleware/cloudinaryMiddleware.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import Report from "../models/reportModel.js";


const __dirname = path.dirname(fileURLToPath(import.meta.url));


// Take Prompt and Captions
// Generate Image With AI Model
// Store On Local Server
// Upload And On Cloudinary
// Remove From Server
// Respond With Caption And Post


const generateAndPost = async (req, res) => {

    let userId = req.user.id
    let newPost

    try {

        // Get Prompt
        const { prompt, caption } = req.body

        // Check if prompt is coming in body
        if (!prompt || !caption) {
            res.status(409)
            throw new Error("Kindly Provide Prompt To Generate Image!")
        }

        // Initialize Google Gen AI Instance
        const ai = new GoogleGenAI({

        })

        // Api Call To Genrate Image
        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-image-preview",
            contents: prompt,
        });

        console.log(response.candidates)

        // Loop Through Correct Response
        for (const part of response.candidates[0].content.parts) {
            if (part.text) {
                console.log(part.text);
            } else if (part.inlineData) {
                const imageData = part.inlineData.data;

                // Convert Test To Image
                const buffer = Buffer.from(imageData, "base64");


                // Save Locally
                const filename = crypto.randomUUID() + ".png";
                const filePath = path.join(__dirname, "../generated-content", filename);

                // Write File Into server
                fs.writeFileSync(filePath, buffer);

                // Upload to cloudinary
                const imageLink = await uploadToCloudinary(filePath)


                // Remove Image From Server
                fs.unlinkSync(filePath)

                // Create Post
                newPost = new Post({
                    user: userId,
                    imageLink: imageLink.secure_url,
                    caption: caption
                })

                // Save Post To DB
                await newPost.save()

                // Aggregate User Details in newPost Object
                await newPost.populate('user')
            }
        }
        res.status(201).json(newPost)
    } catch (error) {
        res.status(409)
        throw new Error("Post Not Created!")

    }
}

const getPosts = async (req, res) => {
    const posts = await Post.find().populate('user')

    if (!posts) {
        res.status(404)
        throw new Error("Posts Not Found")
    }

    res.status(200).json(posts)
}
const getPost = async (req, res) => {
    const post = await Post.findById(req.params.pid).populate('user')

    if (!post) {
        res.status(404)
        throw new Error("Post Not Found")
    }

    res.status(200).json(post)
}

const likeAndUnlikePost = async (req, res) => {
    let currentUser = await User.findById(req.user._id)

    // Check If User Exist
    if (!currentUser) {
        res.status(404)
        throw new Error('User Not Found')
    }


    // Check if post exist
    const post = await Post.findById(req.params.pid).populate('user')

    if (!post) {
        res.status(404)
        throw new Error("Post Not Found")
    }


    // Check if already liked
    if (post.likes.includes(currentUser._id)) {
        // Dislike
        // Remove Follower From Likes
        let updatedLikesList = post.likes.filter(like => like.toString() !== currentUser._id.toString())
        post.likes = updatedLikesList
        await post.save()

    } else {
        // Like
        // Add Follower in Liked
        post.likes.push(currentUser._id)
        await post.save()

    }
    // Populate after save using the post model directly
    await Post.populate(post, { path: 'likes' })
    res.status(200).json(post)
}


const reportPost = async(req, res)=> {
    const {text} = req.body
    const postId = req.params.pid
    const userId = req.user._id


    if (!text){
        res.status(409)
        throw new Error("Please Enter Text")
    }

    const newReport = new Report({
        user : userId,
        post : postId,
        text : text
    })

    await newReport.save()
    await newReport.populate("user")
    await newReport.populate("post")


    if(!newReport){
        res.status(409)
        throw new Error("Unable to Report this Post")
    }
    res.status(201).json(newReport)
}


const postController = { generateAndPost, getPosts, getPost, likeAndUnlikePost , reportPost}

export default postController