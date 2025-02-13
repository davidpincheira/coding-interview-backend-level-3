import { Item, CreateItemDTO, UpdateItemDTO } from '../models/Item'
import { ItemService } from '../services/itemService'

export class ItemController {
    constructor(private service: ItemService) {}

    async getAllItems(): Promise<Item[]> {
        return this.service.getAllItems()
    }

    async getItemById(id: number): Promise<Item | null> {
        return this.service.getItemById(id)
    }

    async createItem(data: CreateItemDTO): Promise<Item> {
        return this.service.createItem(data)
    }

    async updateItem(id: number, data: UpdateItemDTO): Promise<Item | null> {
        return this.service.updateItem(id, data)
    }

    async deleteItem(id: number): Promise<boolean> {
        return this.service.deleteItem(id)
    }

    async getItemByParams(minPrice: number, maxPrice: number) {
        return this.service.getItemByParams(minPrice, maxPrice)
    }
}