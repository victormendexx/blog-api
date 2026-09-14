import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/database';
import { Teacher } from '../models/Teacher';
import * as authService from '../services/authService';

async function seed(): Promise<void> {
  const name = process.env.TEACHER_NAME;
  const email = process.env.TEACHER_EMAIL;
  const password = process.env.TEACHER_PASSWORD;

  if (!name || !email || !password) {
    console.error(
      'Defina TEACHER_NAME, TEACHER_EMAIL e TEACHER_PASSWORD no .env antes de rodar o seed.',
    );
    process.exit(1);
  }

  await connectDB();

  const existing = await Teacher.findOne({ email: email.toLowerCase().trim() });

  if (existing) {
    console.log(`Professor "${email}" já existe. Nada a fazer.`);
  } else {
    await authService.createTeacher(name, email, password);
    console.log(`Professor "${email}" criado com sucesso.`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((error) => {
  console.error('Erro ao rodar o seed:', error);
  process.exit(1);
});