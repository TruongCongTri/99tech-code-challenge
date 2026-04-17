import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { AppError } from '../common/errors/app.error';
import { errorResponse, ValidationErrorDetail } from '../common/utils/responses/api-response';
import { ERROR_CODES } from '../constants/error-codes';
import { MESSAGES } from '../constants/messages';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction 
) => {
  // 1. Handle Zod validation errors (from validate middleware)
  if (
    err instanceof ZodError ||
    (err && typeof err === 'object' && 'name' in err && err.name === 'ZodError')
  ) {
    const zodError = err as ZodError;

    const validationIssues: z.core.$ZodIssue[] =
      zodError.issues || (err as { errors?: z.core.$ZodIssue[] }).errors || [];

    const formattedErrors: ValidationErrorDetail[] = validationIssues.map(
      (e: z.core.$ZodIssue) => ({
        field: e.path.join('.'),
        message: e.message,
      })
    );

    return errorResponse(res, {
      statusCode: 422,
      message: MESSAGES.COMMON.ERROR.INVALID_INPUT,
      error_code: ERROR_CODES.COMMON.VALIDATION_ERROR,
      errors: formattedErrors,
    });
  }

  // 2. Handle business errors (AppError thrown from Service)
  if (err instanceof AppError) {
    return errorResponse(res, {
      statusCode: err.statusCode,
      message: err.message,
      ...(err.errorCode !== undefined && { error_code: err.errorCode }),
    });
  }

  // 3. Handle Prisma errors (equivalent to TypeORM QueryFailedError)
  const prismaErr = err as {
    constructor?: { name: string };
    code?: string;
    meta?: { target?: string[] | string };
  };
  if (
    prismaErr?.constructor?.name === 'PrismaClientKnownRequestError' ||
    prismaErr?.code?.startsWith('P')
  ) {
    // P2002 Code: Duplicate value for unique field
    if (prismaErr.code === 'P2002') {
      const targetField = (prismaErr.meta?.target as string[])?.join(', ') || 'field';

      return errorResponse(res, {
        statusCode: 409,
        message: MESSAGES.SYSTEM.UNIQUE_CONSTRAINT(targetField),
        error_code: ERROR_CODES.DATABASE.UNIQUE_CONSTRAINT_VIOLATION,
      });
    }

    // P2025 Code: Cannot find record(s) to update or delete
    if (prismaErr.code === 'P2025') {
      return errorResponse(res, {
        statusCode: 404,
        message: MESSAGES.SYSTEM.RECORD_NOT_FOUND,
        error_code: ERROR_CODES.DATABASE.RECORD_NOT_FOUND,
      });
    }
  }

  // 4. Handle unknown system errors
  console.error('[SERVER ERROR]:', err);
  return errorResponse(res, {
    statusCode: 500,
    message: MESSAGES.COMMON.ERROR.INTERNAL_SERVER_ERROR,
    error_code: ERROR_CODES.COMMON.INTERNAL_SERVER_ERROR,
  });
};
