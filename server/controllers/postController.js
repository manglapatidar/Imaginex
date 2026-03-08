import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";


const __dirname = path.dirname(fileURLToPath(import.meta.url));

const generateAndPost = async (req, res) => {

    try {

        // Get Prompt
        const { prompt } = req.body

        // Check if prompt is coming in body
        if (!prompt) {
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
                

                


            }
        }
        res.send("Image Generated!")
    } catch (error) {
        res.status(409)
        throw new Error("Image Generation Failed!")

    }


}

const postController = {generateAndPost}

export default postController