import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import dataRoutes from './routes/dataRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import careerRoutes from './routes/careerRoutes.js'; 

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/data', dataRoutes);
app.use('/blog', blogRoutes);
app.use('/team', teamRoutes);
app.use('/applications', applicationRoutes);
app.use('/calendar', calendarRoutes);
app.use('/career', careerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
