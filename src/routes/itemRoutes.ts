import { Server } from "@hapi/hapi"
import { CreateItemDTO, Item, UpdateItemDTO } from "../models/Item";
import { ItemRepository } from "../repositories/itemRepository"
import { ItemService } from "../services/itemService";
import { ItemController } from "../controllers/ItemController";
import { ValidationException } from "../types/validationError";
import { validatePayload } from "../middlewares/validatePayload";

export const itemRoutes = (server: Server) => {
    const itemRepository = new ItemRepository()
    const itemService = new ItemService(itemRepository)
    const itemController = new ItemController(itemService)

    server.route({
        method: 'GET',
        path: '/ping',
        handler: async (req, res) => {
            return {
                ok: true
            }
        }
    }) 

    //new item
    server.route({
        method: 'POST',
        path: '/items',
        options: {  
            pre: [
                { method: validatePayload }
            ],
            payload: {
                parse: true,
                allow: ['application/json']
            }
        },
        handler: async (req, res) => {
            try {            
                
                const payload = req.payload as CreateItemDTO;

                const data: CreateItemDTO = {
                    name: payload.name as string,
                    price: Number(payload.price) as number
                };

                const newItem = await itemController.createItem(data)
                return res.response(newItem).code(201)

            } catch (error) {
                if (error instanceof ValidationException) {
                    return res.response({
                        errors: error.errors
                    }).code(400);
                }
                
                throw error; 
            }
        }
        
    });

    //all items
    server.route({
        method: 'GET',
        path: '/items',
        handler: async (req, res) => {
            try {
                const items = await itemController.getAllItems()
                //parseo el precio para asegurar que sea un numero, esto es porque sino tira error en los tests.
                const parsedItems = items.map(item => ({
                    ...item,
                    price: Number(item.price)
                }))
                return res.response(parsedItems)
            } catch (error) {
                if (error instanceof ValidationException) {
                    return res.response({
                        errors: error.errors
                    }).code(400);
                }

                throw error; 
            }
        }
    });

    //one item by id
    server.route({
        method: 'GET',
        path: '/items/{id}',
        handler: async (req, res) => {
            try {
                const id = parseInt(req.params.id);
            
                if (isNaN(id) || id <= 0) {
                    return res.response({
                        errors: [{
                            field: 'id',
                            message: 'Invalid item ID format' 
                        }]
                    }).code(400)
                }

                const itemFounded = await itemController.getItemById(id);

                if (!itemFounded) {
                    return res.response({ message: "Item not found" }).code(404);
                }

                const parsedItem: Item = {
                    ...itemFounded,
                    price: Number(itemFounded.price)
                };
                
                return res.response(parsedItem);

            } catch (error) {
                if (error instanceof ValidationException) {
                    return res.response({
                        errors: error.errors
                    }).code(400);
                }
                
                throw error; 
            }
            
        }
    });

    //update item
    server.route({
        method: 'PUT',
        path: '/items/{id}',
        options: {
            pre: [
                { method: validatePayload }
            ],
            payload: {
                parse: true,
                allow: ['application/json']
            }
        },
        handler: async (req, res) => {
            try {
                const id = parseInt(req.params.id)

                if (isNaN(id) || id <= 0) {
                    return res.response({
                        errors: [{
                            field: 'id',
                            message: 'Invalid item ID format'
                        }]
                    }).code(400)
                }
                const payload = req.payload as UpdateItemDTO;

                const data : UpdateItemDTO = {
                    name: payload.name,
                    price: Number(payload.price)
                };
                
                const updatedItem = await itemController.updateItem(id, data)

                if (!updatedItem) {
                    return res.response({ 
                        errors: [{
                            message: 'Item not found'
                        }]
                    }).code(404)
                }

                return res.response(updatedItem)
            } catch (error) {
                if (error instanceof ValidationException) {
                    return res.response({
                        errors: error.errors
                    }).code(400);
                }
                
                throw error; 
            }
        }
    })

    // eliminar un item
    server.route({
        method: 'DELETE',
        path: '/items/{id}',
        handler: async (req, res) => {
            try {
                const itemId = parseInt(req.params.id);
                if (isNaN(itemId) || itemId <= 0) {
                    return res.response({ message: "ID de item inválido" }).code(400);
                }

                if (itemId === -1) {
                    return res.response({ message: "Item not found" }).code(404);
                }

                const deleted = await itemController.deleteItem(itemId);
                
                if (!deleted) {
                    return res.response({ message: "Item can't be deleted" }).code(500);
                }
                return res.response({ message: "Item deleted" }).code(204);
            }catch (error) {
                if (error instanceof ValidationException) {
                    return res.response({
                        errors: error.errors
                    }).code(400);
                }
                
                throw error;                
            }

        }
    });

    //one item by params
    server.route({
        method: 'GET',
        path: '/items/filter/{minPrice}/{maxPrice}',
        handler: async (req, res) => {
            try {
                const minPrice = req.params.minPrice;
                const maxPrice = req.params.maxPrice;

                const itemFounded = await itemController.getItemByParams(minPrice, maxPrice);

                if (itemFounded == null) {
                    return res.response({ message: "Item not found" }).code(404);
                }
                
                return res.response(itemFounded);

            } catch (error) {
                if (error instanceof ValidationException) {
                    return res.response({
                        errors: error.errors
                    }).code(400);
                }
                
                throw error; 
            }
            
        }
    });
}