import { Router } from 'express';
import * as postController from '../controllers/postController';
import { validate } from '../middlewares/validate';
import { createPostSchema, updatePostSchema } from '../validations/postValidation';

const router = Router();

// IMPORTANTE: "/search" precisa vir ANTES de "/:id".
// Se não, o Express interpreta "search" como valor do parâmetro :id
// e a rota de busca nunca é alcançada.
router.get('/search', postController.searchPosts);

router.get('/', postController.listPosts);
router.get('/:id', postController.getPostById);
router.post('/', validate(createPostSchema), postController.createPost);
router.put('/:id', validate(updatePostSchema), postController.updatePost);
router.delete('/:id', postController.deletePost);

export default router;