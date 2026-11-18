import { Router } from 'express';
import postRoutes from './postRoutes';
import authRoutes from './authRoutes';
import teacherRoutes from './teacherRoutes';
import studentRoutes from './studentRoutes';

const router = Router();

router.use('/posts', postRoutes);
router.use('/auth', authRoutes);
router.use('/teachers', teacherRoutes);
router.use('/students', studentRoutes);

export default router;
