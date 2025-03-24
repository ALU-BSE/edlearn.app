    const express = require('express');
    const axios = require('axios');
    const app = express();
    const port = 3001; // You can use any available port

    // Middleware to parse JSON requests
    app.use(express.json());

    // Endpoint to validate email
    app.post('/validate-email', async (req, res) => {
    const { email } = req.body;

    // Replace with your AbstractAPI key
    const apiKey = '15c3de8140894c659f7668bc22acdca8';
    const apiUrl = `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${email}`;

    try {
        // Make a request to the AbstractAPI
        const response = await axios.get(apiUrl);
        const data = response.data;

        // Check if the email is deliverable
        if (data.deliverability === 'DELIVERABLE') {
        res.json({ valid: true, message: "Valid email." });
        } else {
        res.json({ valid: false, message: "Email does not exist or is not deliverable." });
        }
    } catch (error) {
        console.error('Error validating email:', error);
        res.status(500).json({ valid: false, message: "Failed to validate email. Please try again." });
    }
    });

    // Start the server
    app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    });