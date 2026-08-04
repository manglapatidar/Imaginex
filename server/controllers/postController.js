import * as fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import uploadToCloudinary from "../middleware/cloudinaryMiddleware.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import Report from "../models/reportModel.js";
import Groq from "groq-sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const generateAndPost = async (req, res) => {
    let userId = req.user.id
    let newPost

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
        res.status(404)
        throw new Error("User Not Found")
    }

    // Check if user has enough credits
    if (user.credits < 1) {
        res.status(409)
        throw new Error("Not Enough Credits!")
    }

    try {
        const { prompt } = req.body

        if (!prompt) {
            res.status(409)
            throw new Error("Kindly Provide Prompt To Generate Image!")
        }

        let enhancedPrompt = prompt;
        try {
            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are an AI assistant that enhances short prompts into highly detailed, creative, and beautiful image generation prompts. Output ONLY the enhanced prompt, no extra text."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                model: "llama-3.1-8b-instant",
            });
            enhancedPrompt = chatCompletion.choices[0]?.message?.content || prompt;
        } catch (err) {
            console.error("Groq enhancement failed, using original prompt:", err);
        }

        const encodedPrompt = encodeURIComponent(enhancedPrompt);
        const seed = Math.floor(Math.random() * 1000000);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=1024&height=1024&nologo=true`;

        // ✅ 30s timeout so fetch doesn't hang forever
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        let imageResponse = await fetch(imageUrl, { 
            signal: controller.signal,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ImagineX/1.0' }
        });
        clearTimeout(timeout);

        if (!imageResponse.ok) {
            console.warn("Pollinations.ai failed, falling back to LoremFlickr");
            // Extract a keyword from the prompt for the fallback image
            const keyword = prompt.split(' ').slice(0, 2).join(',');
            const fallbackUrl = `https://loremflickr.com/1024/1024/${encodeURIComponent(keyword)}`;
            imageResponse = await fetch(fallbackUrl);
            
            if (!imageResponse.ok) {
                throw new Error("Failed to generate image from free API");
            }
        }

        // ✅ Ensure we got an actual image, not an HTML error page
        const contentType = imageResponse.headers.get("content-type");
        if (!contentType || !contentType.startsWith("image/")) {
            throw new Error("API did not return a valid image. Please try again.");
        }

        const arrayBuffer = await imageResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // ✅ Create directory if it doesn't exist
        const generatedDir = path.join(__dirname, "../generated-content");
        if (!fs.existsSync(generatedDir)) {
            fs.mkdirSync(generatedDir, { recursive: true });
        }

        const filename = crypto.randomUUID() + ".png";
        const filePath = path.join(generatedDir, filename);

        fs.writeFileSync(filePath, buffer);

        const imageLink = await uploadToCloudinary(filePath);
        fs.unlinkSync(filePath);

        newPost = new Post({
            user: userId,
            imageLink: imageLink.secure_url,
            prompt: prompt
        })

        await newPost.save()
        await newPost.populate('user')

        await User.findByIdAndUpdate(user._id, { credits: user.credits - 1 }, { new: true })

        res.status(201).json(newPost)

    } catch (error) {
        // ✅ Handle timeout separately
        if (error.name === 'AbortError') {
            res.status(504)
            throw new Error("Image generation timed out. Please try again.")
        }
        res.status(500)
        throw new Error(error.message || "Post Not Created!")
    }
}

const getPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('user').sort({ createdAt: -1 })
        res.status(200).json(posts)
    } catch (error) {
        res.status(500)
        throw new Error("Failed to fetch posts")
    }
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
    const currentUser = await User.findById(req.user._id)

    if (!currentUser) {
        res.status(404)
        throw new Error('User Not Found')
    }

    const post = await Post.findById(req.params.pid).populate('user')

    if (!post) {
        res.status(404)
        throw new Error("Post Not Found")
    }

    if (post.likes.includes(currentUser._id)) {
        // Unlike
        post.likes = post.likes.filter(like => like.toString() !== currentUser._id.toString())
        await post.save()
    } else {
        // Like
        post.likes.push(currentUser._id)
        await post.save()
    }

    await Post.populate(post, { path: 'likes' })
    res.status(200).json(post)
}

const reportPost = async (req, res) => {
    const { text } = req.body
    const postId = req.params.pid
    const userId = req.user._id

    if (!text) {
        res.status(409)
        throw new Error("Please Enter Text")
    }

    const newReport = new Report({
        user: userId,
        post: postId,
        text: text
    })

    await newReport.save()
    await newReport.populate("user")
    await newReport.populate("post")

    if (!newReport) {
        res.status(409)
        throw new Error("Unable to Report this Post")
    }

    res.status(201).json(newReport)
}

const postController = { generateAndPost, getPosts, getPost, likeAndUnlikePost, reportPost }

export default postController