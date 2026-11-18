import { Router } from 'express';
import * as teacherController from '../controllers/teacherController';
import { validate } from '../middlewares/validate';
import { requireAuth, requireTeacher } from '../middlewares/requireAuth';
import { createTeacherSchema, updateTeacherSchema } from '../validations/teacherValidation';

const router = Router();

// Todas as rotas de professores exigem um professor autenticado
router.use(requireAuth, requireTeacher);

router.get('/', teacherController.listTeachers);
router.get('/:id', teacherController.getTeacherById);
router.post('/', validate(createTeacherSchema), teacherController.createTeacher);
router.put('/:id', validate(updateTeacherSchema), teacherController.updateTeacher);
router.delete('/:id', teacherController.deleteTeacher);

export default router;
