const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post('/api/chat', async (req, res) => {
    try {
        const { message, system_instruction } = req.body;
        
        if (!GEMINI_API_KEY) {
            return res.status(500).json({ error: "API key not configured on server" });
        }
        
        const prompt = `You are 'AyurBot', an Ayurvedic expert for BAMS students.
        IMPORTANT: Always give COMPLETE answers. Do not stop mid-sentence.
        Provide comprehensive Ayurvedic information with proper conclusions.
        Include Sanskrit terms where relevant.
        Always end with a proper conclusion.
        Minimum 200 words, maximum 800 words per response.
        
        User question: ${message}`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 3000,
                        topP: 0.9,
                        topK: 50,
                    }
                })
            }
        );
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error:', response.status, errorText);
            return res.status(response.status).json({ error: `Gemini API error: ${response.status}` });
        }
        
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Secure backend server running on http://localhost:${PORT}`));
