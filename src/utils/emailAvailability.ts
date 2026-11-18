import { Teacher } from '../models/Teacher';
import { Student } from '../models/Student';
import { AppError } from './AppError';

/**
 * Professores e alunos ficam em coleções separadas, mas usam o mesmo login.
 * Por isso um email não pode existir nas duas: esta checagem cobre a coleção "do outro
 * perfil" (a unicidade dentro da mesma coleção já é garantida pelo índice unique).
 */
export async function assertEmailFreeInOtherRole(
  email: string,
  role: 'teacher' | 'student',
): Promise<void> {
  const normalized = email.toLowerCase().trim();
  const Other = role === 'teacher' ? Student : Teacher;
  const exists = await (Other as typeof Teacher).exists({ email: normalized });

  if (exists) {
    throw new AppError('Já existe um cadastro com este email', 409);
  }
}
