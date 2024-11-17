const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

// Enable CORS with the correct configuration
app.use(cors({
  origin: '*', // This can be restricted to specific domains like 'http://localhost:3000'
  methods: ['GET', 'POST'], // Ensure POST is allowed
  allowedHeaders: ['Content-Type']
}));

// Middleware to parse JSON requests
app.use(express.json());

// Load environment variables
const apiKey = process.env.API_KEY || 'qP7LhmnUjt47ju327mdJgYRcRX23Dsxw';
const externalUserId = process.env.EXTERNAL_USER_ID || 'user';

// Function to create a chat session
async function createChatSession() {
  try {
    const response = await axios.post(
      'https://api.on-demand.io/chat/v1/sessions',
      {
        pluginIds: ["plugin-1717464304"],
        externalUserId: externalUserId
      },
      {
        headers: { apikey: apiKey }
      }
    );
    return response.data.data.id; // Return session ID
  } catch (error) {
    console.error('Error creating chat session:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Function to submit a query
async function submitQuery(sessionId, query) {
  try {
    const response = await axios.post(
      `https://api.on-demand.io/chat/v1/sessions/${sessionId}/query`,
      {
        endpointId: 'predefined-openai-gpt4o',
        query: query,
        pluginIds: ['plugin-1712327325', 'plugin-1713962163', 'plugin-1726259787'],
        responseMode: 'sync'
      },
      {
        headers: { apikey: apiKey }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error submitting query:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// POST /query endpoint to handle frontend requests
app.post('/query', async (req, res) => {
  const { query } = req.body;
  try {
    console.log('Received query from frontend:', query); // Log user query for debugging

    // Step 1: Create a chat session
    const sessionId = await createChatSession();
    console.log('Session created with ID:', sessionId); // Log session ID

    // Step 2: Submit the query
    const queryResponse = await submitQuery(sessionId, query);
    console.log('Query response received:', queryResponse); // Log API response

    // Step 3: Send the response back to the frontend
    res.json({ response: queryResponse.data.answer });

  } catch (error) {
    console.error('Error handling query:', error);
    res.status(500).json({ error: 'Error processing query.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
