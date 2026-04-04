

const express = require('express');
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const bodyparser = require("body-parser");
require("dotenv").config();

const passportLib = require('passport');
require('./config/passport'); 

const response = require('./middleware/response');

const app = express();

app.use(helmet());
app.use(morgan("dev"));

// ✅ CORS must come before routes and passport
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.use(passportLib.initialize()); // ✅ after body parser, after cors

app.use(response);

// MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("MongoDB connection Error", err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctor', require('./routes/doctor'));
app.use('/api/patient', require('./routes/patient'));
app.use('/api/appointment', require('./routes/appointment'));
app.use('/api/payment',require('./routes/payment'))
app.get('/health', (req, res) => {
  res.status(200).json({ status: "ok", time: new Date().toISOString() });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));