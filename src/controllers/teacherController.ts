import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination } from '../utils/pagination';
import * as teacherService from '../services/teacherService';

export const listTeachers = asyncHandler(async (req: Request, res: Response) => {
  const result = await teacherService.listTeachers(parsePagination(req.query));
  res.status(200).json({ success: true, data: result });
});

export const getTeacherById = asyncHandler(async (req: Request, res: Response) => {
  const teacher = await teacherService.getTeacherById(req.params.id);
  res.status(200).json({ success: true, data: teacher });
});

export const createTeacher = asyncHandler(async (req: Request, res: Response) => {
  const teacher = await teacherService.createTeacher(req.body);
  res.status(201).json({ success: true, data: teacher });
});

export const updateTeacher = asyncHandler(async (req: Request, res: Response) => {
  const teacher = await teacherService.updateTeacher(req.params.id, req.body);
  res.status(200).json({ success: true, data: teacher });
});

export const deleteTeacher = asyncHandler(async (req: Request, res: Response) => {
  await teacherService.deleteTeacher(req.params.id);
  res.status(200).json({ success: true, data: null });
});
