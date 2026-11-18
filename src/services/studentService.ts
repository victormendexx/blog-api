import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { Student, IStudent } from '../models/Student';
import { AppError } from '../utils/AppError';
import { rethrowDuplicateEmail } from '../utils/mongoErrors';
import { assertEmailFreeInOtherRole } from '../utils/emailAvailability';
import { buildPaginatedResult, PaginatedResult, PaginationParams } from '../utils/pagination';
import { CreateStudentInput, UpdateStudentInput } from '../validations/studentValidation';

const SALT_ROUNDS = 10;

function assertValidId(id: string): void {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('ID de aluno inválido', 400);
  }
}

/** Lista alunos paginados, em ordem alfabética. */
export async function listStudents(
  pagination: PaginationParams,
): Promise<PaginatedResult<IStudent>> {
  const { page, limit } = pagination;
  const [items, total] = await Promise.all([
    Student.find()
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Student.countDocuments(),
  ]);

  return buildPaginatedResult(items, total, pagination);
}

export async function getStudentById(id: string): Promise<IStudent> {
  assertValidId(id);
  const student = await Student.findById(id);

  if (!student) {
    throw new AppError('Aluno não encontrado', 404);
  }

  return student;
}

export async function createStudent(data: CreateStudentInput): Promise<IStudent> {
  await assertEmailFreeInOtherRole(data.email, 'student');
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  try {
    return await Student.create({ name: data.name, email: data.email, passwordHash });
  } catch (error) {
    return rethrowDuplicateEmail(error);
  }
}

/** Atualização parcial. Se `password` vier, é gravado como novo hash. */
export async function updateStudent(id: string, data: UpdateStudentInput): Promise<IStudent> {
  assertValidId(id);
  const { password, ...rest } = data;

  if (rest.email) {
    await assertEmailFreeInOtherRole(rest.email, 'student');
  }

  const update: Partial<Pick<IStudent, 'name' | 'email' | 'passwordHash'>> = { ...rest };

  if (password) {
    update.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  }

  let student: IStudent | null;

  try {
    student = await Student.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  } catch (error) {
    return rethrowDuplicateEmail(error);
  }

  if (!student) {
    throw new AppError('Aluno não encontrado', 404);
  }

  return student;
}

export async function deleteStudent(id: string): Promise<void> {
  assertValidId(id);
  const student = await Student.findByIdAndDelete(id);

  if (!student) {
    throw new AppError('Aluno não encontrado', 404);
  }
}
