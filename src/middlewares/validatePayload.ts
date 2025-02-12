import { Request, ResponseToolkit } from '@hapi/hapi';
import { ValidationException } from '../types/errors';

export const validatePayload = (req: Request, res: ResponseToolkit) => {
    if (!req.payload) {
        throw new ValidationException([{
            field: 'payload',
            message: 'Request payload is required'
        }]);
    }
    
    return res.continue;
};