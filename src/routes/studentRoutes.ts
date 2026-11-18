import { Router } from 'express';
import * as studentController from '../controllers/studentController';
import { validate } from '../middlewares/validate';
import { requireAuth, requireTeacher } from '../middlewares/requireAuth';
import { createStudentSchema, updateStudentSchema } from '../validations/studentValidation';

const router = Router();

// Todas as rotas de alunos exigem um professor autenticado
router.use(requireAuth, requireTeacher);

router.get('/', studentController.listStudents);
router.get('/:id', studentController.getStudentById);
router.post('/', validate(createStudentSchema), studentController.createStudent);
router.put('/:id', validate(updateStudentSchema), studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

export default router;
