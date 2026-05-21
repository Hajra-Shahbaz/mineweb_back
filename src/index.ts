import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.ts';
import userRouter from './route/user.ts'; // <--- 1. Import the route
import skillRouter from './route/skill.ts';
import experienceRouter from './route/experience.ts';
import projectRouter from './route/project.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/api/user', userRouter); // <--- 2. Register the route baseline path
app.use('/api/skill', skillRouter); // <--- 3. Register the skill route
app.use('/api/experience', experienceRouter); // <--- 4. Register the experience route
app.use('/api/project', projectRouter);

// Sample Route to test setup
app.get('/', (_req, res) => {
  res.send('Portfolio API is running smoothly!');
});

app.listen(PORT, () => {
  console.log(`[Server] running on http://localhost:${PORT}`);
});