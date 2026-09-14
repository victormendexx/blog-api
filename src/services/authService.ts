import bcrypt from 'bcryptjs';
import { Teacher } from '../models/Teacher';
import { AppError } from '../utils/AppError';
import { signToken } from '../utils/jwt';

const SALT_ROUNDS = 10;

export async function login(
  email: string,
  password: string,
): Promise<{ token: string; teacher: { id: string; name: string; email: string } }> {
  const teacher = await Teacher.findOne({ email: email.toLowerCase().trim() });

  if (!teacher) {
    throw new AppError('Credenciais inválidas', 401);
  }

  const passwordMatches = await bcrypt.compare(password, teacher.passwordHash);

  if (!passwordMatches) {
    throw new AppError('Credenciais inválidas', 401);
  }

  const token = signToken({ sub: teacher.id as string, email: teacher.email });

  return {
    token,
    teacher: { id: teacher.id as string, name: teacher.name, email: teacher.email },
  };
}

/** Usado só pelo script de seed (não exposto via HTTP). */
export async function createTeacher(name: string, email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  return Teacher.create({ name, email: email.toLowerCase().trim(), passwordHash });
}