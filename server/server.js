import express from "express"
import dotenv from "dotenv"
import colors from "colors"
import connectDB from "./config/dbConfig.js"

// Local Imports
import authRoutes from "./routes/authRoutes.js"
import followRoutes from "./routes/followRoutes.js"
import errorHandler from "./middleware/errorHandler.js"
import profileRoutes from "./routes/profileRoutes.js"

dotenv.config()

const PORT = process.env.PORT || 5000
const app = express()

//DB Connection
connectDB()



//Body Parser
app.use(express.json())
app.use(express.urlencoded())




//Default Route 
app.get("/", (req, res) => {
    res.json({
        message : "WELCOME TO IMAGINEX API.."
    })
})

// Auth Routes
app.use("/api/auth", authRoutes )

//Follow Routes

app.use("/api/user", followRoutes )

//Profile Routes
app.use("/api/profile",profileRoutes )

// Error Handler
app.use(errorHandler)



app.listen(PORT , () => {
    console.log(`SERVER IS RUNNING AT PORT : ${PORT}`.bgBlue.black)

})