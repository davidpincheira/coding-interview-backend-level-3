import { Item, CreateItemDTO, UpdateItemDTO, validateName, validatePrice } from '../models/Item'
import { ItemRepository } from '../repositories/itemRepository'
import { ValidationError, ValidationException } from '../types/validationError';

export class ItemService {
    constructor(private repository: ItemRepository) {}
    
    async getAllItems(): Promise<Item[]> {
        return this.repository.findAll()
    }
    
    async getItemById(id: number): Promise<Item | null> {
        return this.repository.findById(id)
    }
    
    async createItem(data: CreateItemDTO): Promise<Item> {

        const errors: ValidationError[] = [];
        const nameError = validateName(data.name);
        const priceError = validatePrice(data.price);

        if (nameError) errors.push(nameError);
        if (priceError) errors.push(priceError);

        if (errors.length > 0) {
            throw new ValidationException(errors);
        }

        const itemData: CreateItemDTO = {
            name: data.name,
            price: Number(data.price)
        };

        return this.repository.create(itemData)
    }

    async updateItem(id: number, data: UpdateItemDTO): Promise<Item | null> {
        const errors: ValidationError[] = [];

        const existingItem = await this.repository.findById(id)
        if (!existingItem) {
            throw new Error('Item not found')
        }

        const nameError = validateName(data.name);
        const priceError = validatePrice(data.price);

        if (nameError) errors.push(nameError);
        if (priceError) errors.push(priceError);

        if (errors.length > 0) {
            throw new ValidationException(errors);
        }

        const updateData = {
            name: data.name?.trim(),
            price: Number(data.price)
        }

        return this.repository.update(id, updateData)
    }

    async deleteItem(id: number): Promise<boolean> {
        const existingItem = await this.repository.findById(id)
        if (!existingItem) {
            throw new Error('Item not found')
        }

        return this.repository.delete(id)
    }

    async getItemByParams(minPrice: number, maxPrice: number): Promise<Item[]> {
        return this.repository.findByPriceRange(minPrice, maxPrice)        
    }

}
