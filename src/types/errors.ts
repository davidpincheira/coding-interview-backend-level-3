import { ValidationError } from "./validationError";

export enum ErrorType {
    VALIDATION = 'VALIDATION_ERROR',
    NOT_FOUND = 'NOT_FOUND_ERROR',
    DATABASE = 'DATABASE_ERROR',
    UNAUTHORIZED = 'UNAUTHORIZED_ERROR',
    FORBIDDEN = 'FORBIDDEN_ERROR',
    INTERNAL = 'INTERNAL_ERROR'
}

export class AppError extends Error {
    constructor(
        public type: ErrorType,
        public message: string,
        public statusCode: number,
        public errors?: any[]
    ) {
        super(message);
        this.name = type;
    }
}

export class DatabaseError extends AppError {
    constructor(message: string, errors?: any[]) {
        super(ErrorType.DATABASE, message, 500, errors);
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(ErrorType.NOT_FOUND, `${resource} not found`, 404);
    }
}

export class ValidationException extends AppError {
    constructor(errors: ValidationError[]) {
        super(ErrorType.VALIDATION, 'Validation failed', 400, errors);
    }
}