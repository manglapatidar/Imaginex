import express from "express"
import dotenv from "dotenv"
import colors from "colors"
import path from 'node:path'
import { fileURLToPath } from "url"
import connectDB from "./config/dbConfig.js"

// Local Imports
import authRoutes from "./routes/authRoutes.js"
import followRoutes from "./routes/followRoutes.js"
import errorHandler from "./middleware/errorHandler.js"
import profileRoutes from "./routes/profileRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import postRoutes from"./routes/postRoutes.js"
import savedPostRoutes from "./routes/savedPostRoutes.js"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


const PORT = process.env.PORT || 5000
const app = express()

//DB Connection
connectDB()



//Body Parser
app.use(express.json())
app.use(express.urlencoded())


// Auth Routes
app.use("/api/auth", authRoutes )

//Follow Routes

app.use("/api/user", followRoutes )

//Profile Routes
app.use("/api/profile", profileRoutes )

// Admin Routes
app.use("/api/admin", adminRoutes)

// Post Routes
app.use("/api/posts", postRoutes)


// Saved Posts
app.use("/api/saved-posts", savedPostRoutes)

const buildPath = path.resolve(__dirname, '../client/dist');

// Static File Serving & SPA Routing
if (process.env.NODE_ENV === "production"){
    // Serve static files from the build directory
    app.use(express.static(buildPath));

    // Express v5 requires a named parameter for wildcards (/*splat)
    app.get('/*splat', (req, res) => {
        res.sendFile(path.join(buildPath, 'index.html'), (err) => {
            if (err){
                // If index.html is missing , this provides a clearer error
                res.status(500).send("Build File index.html not found. Ensure you ran 'npm run build'")
            }
        });
    });
} else {
    app.get("/", (req, res) => {
        res.send("API is running...(Development Mode)");
    });
}

// Error Handler
app.use(errorHandler)



app.listen(PORT , () => {
    console.log(`SERVER IS RUNNING AT PORT : ${PORT}`.bgBlue.black)
})