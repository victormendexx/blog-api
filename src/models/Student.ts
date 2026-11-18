import { Schema, model, Document } from 'mongoose';

/** Aluno: faz login para ler os posts, mas não pode criar/editar conteúdo. */
export interface IStudent extends Document {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: [true, 'O nome é obrigatório'], trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  {
    timestamps: true,
    // Nunca expõe o hash da senha nas respostas JSON da API
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.passwordHash;
        return ret;
      },
    },
  },
);

export const Student = model<IStudent>('Student', studentSchema);
