import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.ts';
import userRouter from './route/user.ts'; // <--- 1. Import the route
import skillRouter from './route/skill.ts';
import experienceRouter from './route/experience.ts';
import projectRouter from './route/project.ts';
import blogRouter from './route/blog.ts';
import serviceRouter from './route/service.ts';
import contactRouter from './route/contact.ts';
import socialRouter from './route/social.ts';
import educationRouter from './route/education.ts';
import navRouter from './route/nav.ts'; // <--- 2. Import the nav route
import taskRoutes from './route/list.ts';
// ... existing configurations

import cors from 'cors';

dotenv.config();
const allowedOrigins = [
  'http://localhost:3000',
  'https://www.hasoftz.com',
  'https://hasoftz.com' // Catches traffic without the www prefix too!
];



const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or Postman requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by Security Policy: CORS origin not allowed.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/api/user', userRouter); // <--- 2. Register the route baseline path
app.use('/api/skill', skillRouter); // <--- 3. Register the skill route
app.use('/api/experience', experienceRouter); // <--- 4. Register the experience route
app.use('/api/project', projectRouter);
app.use('/api/blog', blogRouter);
app.use('/api/service', serviceRouter);
app.use('/api/contact', contactRouter); 
app.use('/api/social', socialRouter);
app.use('/api/education', educationRouter);
app.use('/api/nav', navRouter);
app.use('/api/tasks', taskRoutes);

app.get('/', (_req, res) => {
  res.send('Portfolio API is running smoothly!'); 
});

app.listen(PORT, () => {
  console.log(`[Server] running on http://localhost:${PORT}`);
});