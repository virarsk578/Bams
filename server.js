const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        console.log('📝 Received message:', message?.substring(0, 100) + '...');
        
        if (!GEMINI_API_KEY) {
            console.error('❌ No API key found');
            return res.status(500).json({ 
                error: "API key not configured on server",
                message: "Please check your .env file"
            });
        }
        
        const prompt = `You are 'AyurBot', an Ayurvedic expert for BAMS students.
        IMPORTANT: Always give COMPLETE answers. Do not stop mid-sentence.
        Provide comprehensive Ayurvedic information with proper conclusions.
        Include Sanskrit terms where relevant.
        Always end with a proper conclusion.
        Minimum 200 words, maximum 800 words per response.
        
        User question: ${message}`;

        console.log('🔗 Calling Gemini API...');
        
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ 
                        parts: [{ text: prompt }] 
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2000,
                        topP: 0.9,
                        topK: 40,
                    }
                })
            }
        );
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Gemini API error:', response.status, errorText);
            
            // Return a mock response for testing if API fails
            return res.json({
                candidates: [{
                    content: {
                        parts: [{
                            text: `I'm currently experiencing technical difficulties with the AI service. Here's a sample Ayurvedic response for "${message.substring(0, 50)}...":
                            
                            Ayurveda emphasizes balance of the three doshas: Vata, Pitta, and Kapha. Each dosha represents different elements and governs specific bodily functions. Treatment involves diet, lifestyle, herbs, and therapies tailored to individual constitution (Prakriti).

                            For now, please try again later or contact support.`
                        }]
                    }
                }]
            });
        }
        
        const data = await response.json();
        console.log('✅ Gemini API response received');
        res.json(data);
        
    } catch (error) {
        console.error('❌ Server error:', error);
        res.status(500).json({ 
            error: error.message,
            text: "Unable to connect to AI service. Please ensure the server is running and check your API key."
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Ayurveez backend is running',
        geminiConfigured: !!GEMINI_API_KEY
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Backend server is working!',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Ayurveez backend server running on http://localhost:${PORT}`);
    console.log(`📊 API Key configured: ${GEMINI_API_KEY ? 'Yes' : 'No'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
