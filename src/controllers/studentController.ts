import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination } from '../utils/pagination';
import * as studentService from '../services/studentService';

export const listStudents = asyncHandler(async (req: Request, res: Response) => {
  const result = await studentService.listStudents(parsePagination(req.query));
  res.status(200).json({ success: true, data: result });
});

export const getStudentById = asyncHandler(async (req: Request, res: Response) => {
  const student = await studentService.getStudentById(req.params.id);
  res.status(200).json({ success: true, data: student });
});

export const createStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await studentService.createStudent(req.body);
  res.status(201).json({ success: true, data: student });
});

export const updateStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await studentService.updateStudent(req.params.id, req.body);
  res.status(200).json({ success: true, data: student });
});

export const deleteStudent = asyncHandler(async (req: Request, res: Response) => {
  await studentService.deleteStudent(req.params.id);
  res.status(200).json({ success: true, data: null });
});
