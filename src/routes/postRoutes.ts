import { Router } from 'express';
import * as postController from '../controllers/postController';
import { validate } from '../middlewares/validate';
import { requireAuth, requireTeacher } from '../middlewares/requireAuth';
import { createPostSchema, updatePostSchema } from '../validations/postValidation';

const router = Router();

// Todas as rotas de posts exigem login (professor ou aluno)
router.use(requireAuth);

// "/search" precisa vir ANTES de "/:id" (ver Passo 4 do back-end)
router.get('/search', postController.searchPosts);

router.get('/', postController.listPosts);
router.get('/:id', postController.getPostById);

// Escrita: só professores
router.post('/', requireTeacher, validate(createPostSchema), postController.createPost);
router.put('/:id', requireTeacher, validate(updatePostSchema), postController.updatePost);
router.delete('/:id', requireTeacher, postController.deletePost);

export default router;
