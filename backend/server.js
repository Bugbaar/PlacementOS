require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// Centralized error handler as a safety net for anything not caught
// in individual controllers.
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Recruiter Portal API running on port ${PORT}`));
};

start();

module.exports = app;
