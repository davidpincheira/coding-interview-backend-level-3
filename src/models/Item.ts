import { ValidationError } from "../types/validationError"

export type Item = {
    id: number
    name: string
    price: number
}
export type CreateItemDTO = Omit<Item, 'id'>
export type UpdateItemDTO = Partial<CreateItemDTO>;

//custom validation
export const validateName = (name: string | undefined): ValidationError | null => {
    if (!name || name.trim() === '') {
        return { field: 'name', message: `Field "name" is required` };
    }

    if (name.length > 255) {
        return { field: 'name', message: `Field "name" cannot be longer than 255 characters` };
    }
    
    return null;
};

export const validatePrice = (price: number | undefined): ValidationError | null => {
    if (price === undefined || isNaN(price)) {
        return { field: 'price', message: `Field "price" is required` };
    }

    if (price < 0) {
        return { field: 'price',message: `Field "price" cannot be negative` };
    }

    if(price > 10000000){
        return { field: 'price', message: `Field "price" cannot be greater than 10000000` };
    }

    return null;
};