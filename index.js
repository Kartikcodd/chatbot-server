    require("dotenv").config();
    const express = require("express")
    const cors = require("cors");
    const { GoogleGenAI } = require("@google/genai");
    const app = express();


    const corsOptions = {
    origin: [
        "http://localhost:5173",
        "https://chatbot-frontend-fawn.vercel.app/"
    ],
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true
};

app.use(cors(corsOptions));

    app.use(cors());
    app.use(express.json());


    const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY)


    app.post('/generate', async(req , res )=>{
        const {prompt} = req.body;
        if(!prompt){
            return res.status(400).send({error: "Prompt required"})
        }

        try {
        const response = await genAI.models.generateContent({
                model: "gemini-1.5-flash", // Using the full model path for older versions
                contents: [{
                    role: "user",
                    parts: [{ text: prompt }]
                }],
            });
            
            // Safely check the structure of the older response format
            if (!response || !response.candidates || response.candidates.length === 0 || !response.candidates[0].content || !response.candidates[0].content.parts || response.candidates[0].content.parts.length === 0) {
                console.error("Invalid response structure from API:", JSON.stringify(response, null, 2));
                return res.status(500).send({ error: "Failed to get a valid response from the AI." });
            }

            // Safely extract the text from the older response format
            const text = response.candidates[0].content.parts[0].text;
            
            return res.status(200).send({ generatedText: text });

        } catch (error) {
            console.error("Error generating content:", error);
            res.status(500).send({ error: 'Failed to generate content' });
        }
    })


    app.listen(process.env.PORT || 3000 , () =>{
        console.log("server is running on port 3000")    
    }
    )