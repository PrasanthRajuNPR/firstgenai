const axios = require('axios');
const Chat = require('../models/Chat');

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    if (!message) return res.status(400).json({ message: 'Message is required' });

    let chat = await Chat.findOne({ userId });
    if (!chat) {
      chat = await Chat.create({ userId, messages: [] });
    }

    // Add user message
    chat.messages.push({ role: 'user', content: message });

    // Format history for Gemini (Gemini uses 'user' and 'model')
    // We map your stored roles to Gemini-compatible roles
    const recentHistory = chat.messages.slice(-11, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    let reply = '';

    try {
      if (process.env.GEMINI_API_KEY) {
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        // Using Gemini 2.5 Flash for fast, conversational responses
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        const response = await axios.post(API_URL, {
          contents: [
            ...recentHistory,
            { role: 'user', parts: [{ text: message }] }
          ],
          systemInstruction: {
            parts: [{ 
              text: `You are EduBot, an AI learning companion for Indian engineering students. 
              You help with study plans, technical concepts, career guidance for placements, higher studies, core roles, and startups. 
              Keep responses concise and practical.` 
            }]
          },
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7,
          }
        });

        reply = response.data.candidates[0].content.parts[0].text;
      } else {
        reply = "I'm EduBot! Please configure your GEMINI_API_KEY to enable my full brain. Meanwhile, let's stick to the basics!";
      }
    } catch (aiErr) {
      console.error('Gemini Chat Error:', aiErr.response?.data || aiErr.message);
      reply = "I'm having a bit of a 'brain freeze' right now. Try again in a second?";
    }

    // Save the reply as 'assistant' to maintain your existing DB schema consistency
    chat.messages.push({ role: 'assistant', content: reply });
    await chat.save();

    res.json({ reply, messages: chat.messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Chat error' });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId: req.user._id });
    res.json({ messages: chat ? chat.messages : [] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chat history' });
  }
};

module.exports = { sendMessage, getChatHistory };