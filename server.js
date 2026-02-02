const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS, Images)
app.use(express.static(path.join(__dirname)));

// Route for the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Backend API endpoint to handle contact form submission
app.post('/contact', async (req, res) => {
    const { name, email, message } = req.body;
    
    console.log('Received Contact Form Submission:');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Message:', message);

    // Check if password is still the default placeholder
    if (!process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your_app_password_here') {
        console.log('Error: EMAIL_PASS is not configured in .env file');
        return res.status(500).json({ 
            success: false, 
            message: 'Configuration Error: Please update .env with your Gmail App Password.' 
        });
    }

    // Create a transporter using your email service (e.g., Gmail)
    // NOTE: You must use an App Password if using Gmail with 2FA
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Set this in .env file
            pass: process.env.EMAIL_PASS  // Set this in .env file
        }
    });

    const mailOptions = {
        from: email, // Sender address (the user who filled the form)
        to: process.env.EMAIL_USER, // Receiver address (your email)
        subject: `New Portfolio Message from ${name}`,
        text: `You have received a new message from your portfolio website.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
        res.json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        
        // Provide more specific error messages based on common nodemailer errors
        let errorMessage = 'Failed to send message.';
        if (error.code === 'EAUTH') {
            errorMessage = 'Authentication failed. Check your email and app password.';
        }
        
        res.status(500).json({ success: false, message: errorMessage });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
