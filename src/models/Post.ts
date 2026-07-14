import { Schema, model, Document } from 'mongoose';

// Interface que descreve o formato de um documento Post no TypeScript
export interface IPost extends Document {
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, 'O título é obrigatório'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'O conteúdo é obrigatório'],
    },
    author: {
      type: String,
      required: [true, 'O autor é obrigatório'],
      trim: true,
    },
  },
  {
    // Adiciona createdAt e updatedAt automaticamente
    timestamps: true,
  },
);

// Índice de texto: dá suporte a buscas por palavra-chave em title/content
// (usado no GET /posts/search, que implementamos no Passo 4)
postSchema.index({ title: 'text', content: 'text' });

export const Post = model<IPost>('Post', postSchema);
