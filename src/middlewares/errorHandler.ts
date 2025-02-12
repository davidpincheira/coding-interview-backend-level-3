import { Request, ResponseToolkit } from '@hapi/hapi';
import { ValidationException } from '../types/errors';

export const errorHandler = (error: Error, req: Request, res: ResponseToolkit) => {
    if (error instanceof ValidationException) {
        return res.response({
            errors: error.errors
        }).code(400);
    }

    return res.response({
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
    }).code(500);
};