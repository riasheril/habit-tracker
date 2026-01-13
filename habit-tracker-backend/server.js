const express = require('express');
const cors = require('cors');
require('dotenv').config();

const habitsRouter = require('./routes/habits');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/habits', habitsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Habit Tracker API is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Habit Tracker API' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
