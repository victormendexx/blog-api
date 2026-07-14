import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as postService from '../services/postService';

export const listPosts = asyncHandler(async (_req: Request, res: Response) => {
  const posts = await postService.listPosts();
  res.status(200).json({ success: true, data: posts });
});

export const getPostById = asyncHandler(async (req: Request, res: Response) => {
  const post = await postService.getPostById(req.params.id);
  res.status(200).json({ success: true, data: post });
});

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const post = await postService.createPost(req.body);
  res.status(201).json({ success: true, data: post });
});

export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await postService.updatePost(req.params.id, req.body);
  res.status(200).json({ success: true, data: post });
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  await postService.deletePost(req.params.id);
  res.status(200).json({ success: true, data: null });
});

export const searchPosts = asyncHandler(async (req: Request, res: Response) => {
  const term = typeof req.query.q === 'string' ? req.query.q : '';
  const posts = await postService.searchPosts(term);
  res.status(200).json({ success: true, data: posts });
});