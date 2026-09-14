import { Router } from 'express';
import postRoutes from './postRoutes';
import authRoutes from './authRoutes';

const router = Router();

router.use('/posts', postRoutes);
router.use('/auth', authRoutes);

export default router;