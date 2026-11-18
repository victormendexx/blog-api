import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { Teacher, ITeacher } from '../models/Teacher';
import { AppError } from '../utils/AppError';
import { rethrowDuplicateEmail } from '../utils/mongoErrors';
import { assertEmailFreeInOtherRole } from '../utils/emailAvailability';
import { buildPaginatedResult, PaginatedResult, PaginationParams } from '../utils/pagination';
import { CreateTeacherInput, UpdateTeacherInput } from '../validations/teacherValidation';

const SALT_ROUNDS = 10;

function assertValidId(id: string): void {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('ID de professor inválido', 400);
  }
}

/** Lista professores paginados, em ordem alfabética. */
export async function listTeachers(
  pagination: PaginationParams,
): Promise<PaginatedResult<ITeacher>> {
  const { page, limit } = pagination;
  const [items, total] = await Promise.all([
    Teacher.find()
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Teacher.countDocuments(),
  ]);

  return buildPaginatedResult(items, total, pagination);
}

export async function getTeacherById(id: string): Promise<ITeacher> {
  assertValidId(id);
  const teacher = await Teacher.findById(id);

  if (!teacher) {
    throw new AppError('Professor não encontrado', 404);
  }

  return teacher;
}

export async function createTeacher(data: CreateTeacherInput): Promise<ITeacher> {
  await assertEmailFreeInOtherRole(data.email, 'teacher');
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  try {
    return await Teacher.create({ name: data.name, email: data.email, passwordHash });
  } catch (error) {
    return rethrowDuplicateEmail(error);
  }
}

/** Atualização parcial. Se `password` vier, é gravado como novo hash. */
export async function updateTeacher(id: string, data: UpdateTeacherInput): Promise<ITeacher> {
  assertValidId(id);
  const { password, ...rest } = data;

  if (rest.email) {
    await assertEmailFreeInOtherRole(rest.email, 'teacher');
  }

  const update: Partial<Pick<ITeacher, 'name' | 'email' | 'passwordHash'>> = { ...rest };

  if (password) {
    update.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  }

  let teacher: ITeacher | null;

  try {
    teacher = await Teacher.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  } catch (error) {
    return rethrowDuplicateEmail(error);
  }

  if (!teacher) {
    throw new AppError('Professor não encontrado', 404);
  }

  return teacher;
}

export async function deleteTeacher(id: string): Promise<void> {
  assertValidId(id);
  const teacher = await Teacher.findByIdAndDelete(id);

  if (!teacher) {
    throw new AppError('Professor não encontrado', 404);
  }
}
