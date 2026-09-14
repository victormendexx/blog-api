import { Router } from 'express';
import * as postController from '../controllers/postController';
import { validate } from '../middlewares/validate';
import { requireAuth } from '../middlewares/requireAuth';
import { createPostSchema, updatePostSchema } from '../validations/postValidation';

const router = Router();

// "/search" precisa vir ANTES de "/:id" (ver Passo 4 do back-end)
router.get('/search', postController.searchPosts);

router.get('/', postController.listPosts);
router.get('/:id', postController.getPostById);

// Rotas de escrita agora exigem autenticação
router.post('/', requireAuth, validate(createPostSchema), postController.createPost);
router.put('/:id', requireAuth, validate(updatePostSchema), postController.updatePost);
router.delete('/:id', requireAuth, postController.deletePost);

export default router;