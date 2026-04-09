import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types';

export function sendSuccess<T>(res: Response, data: T, message = 'Success', statusCode = 200): void {
  const response: ApiResponse<T> = { success: true, message, data };
  res.status(statusCode).json(response);
}

export function sendCreated<T>(res: Response, data: T, message = 'Created successfully'): void {
  sendSuccess(res, data, message, 201);
}

export function sendPaginated<T>(res: Response, result: PaginatedResponse<T>, message = 'Success'): void {
  res.status(200).json({ success: true, message, ...result });
}

export function sendError(res: Response, message: string, statusCode = 400, errors?: Record<string, string[]>): void {
  const response: ApiResponse = { success: false, message, errors };
  res.status(statusCode).json(response);
}
