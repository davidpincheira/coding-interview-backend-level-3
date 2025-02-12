export type ValidationError = {
    field: string;
    message: string;
};

export class ValidationException extends Error {
    constructor(public errors: ValidationError | ValidationError[]) {
        super(JSON.stringify(errors));
        this.name = 'ValidationException';
    }
}
