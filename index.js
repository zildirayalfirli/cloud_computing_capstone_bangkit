import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import incomeRoutes from './routes/incomeRoutes.js';
import expanseRoutes from "./routes/expanseRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";

dotenv.config();

const app = express();
let corsOptions = {
  origin: "http://localhost:8081",
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/expanse', expanseRoutes);
app.use('/api/wallet', walletRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
