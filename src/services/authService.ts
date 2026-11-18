import bcrypt from 'bcryptjs';
import { Teacher } from '../models/Teacher';
import { Student } from '../models/Student';
import { AppError } from '../utils/AppError';
import { signToken, UserRole } from '../utils/jwt';

const SALT_ROUNDS = 10;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResult {
  token: string;
  user: AuthUser;
  /** Mantido para compatibilidade com o front-end web (Fase 3); só vem para professores. */
  teacher?: { id: string; name: string; email: string };
}

/**
 * Login único para professores e alunos. Procura primeiro entre os professores e depois entre
 * os alunos (um email nunca existe nos dois — ver assertEmailFreeInOtherRole).
 */
export async function login(email: string, password: string): Promise<LoginResult> {
  const normalized = email.toLowerCase().trim();
  const teacher = await Teacher.findOne({ email: normalized });
  const account = teacher ?? (await Student.findOne({ email: normalized }));
  const role: UserRole = teacher ? 'teacher' : 'student';

  if (!account || !account.passwordHash) {
    throw new AppError('Credenciais inválidas', 401);
  }

  const passwordMatches = await bcrypt.compare(password, account.passwordHash);

  if (!passwordMatches) {
    throw new AppError('Credenciais inválidas', 401);
  }

  const user: AuthUser = {
    id: account.id as string,
    name: account.name,
    email: account.email,
    role,
  };
  const token = signToken({ sub: user.id, email: user.email, role });

  return {
    token,
    user,
    ...(role === 'teacher' ? { teacher: { id: user.id, name: user.name, email: user.email } } : {}),
  };
}

/** Usado só pelo script de seed (não exposto via HTTP). */
export async function createTeacher(name: string, email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  return Teacher.create({ name, email: email.toLowerCase().trim(), passwordHash });
}
