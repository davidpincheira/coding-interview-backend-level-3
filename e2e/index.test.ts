import { initializeServer } from '../src/server'
import { Server } from '@hapi/hapi'

describe('E2E Tests', () => {
    let server: Server
    type Item = {
        id: number
        name: string
        price: number
    }

    beforeEach(async () => {
        server = await initializeServer()
    })

    it('should get a response with status code 200', async () => {
        await server.inject({
            method: 'GET',
            url: '/ping'
        })
            .then(response => {
                expect(response.statusCode).toBe(200)
                expect(response.result).toEqual({ ok: true })
            })
    });

    describe("Basic Items functionality", () => {
        it("should be able to list all items", async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/items'
            })
            expect(response.statusCode).toBe(200)
            expect(response.result).toEqual([])

            await server.inject({
                method: 'POST',
                url: '/items',
                payload: {
                    name: 'Item 1',
                    price: 10
                }
            })

            const response2 = await server.inject({
                method: 'GET',
                url: '/items'
            })
            expect(response2.statusCode).toBe(200)
            expect(response2.result).toEqual([{
                id: expect.any(Number),
                name: 'Item 1',
                price: 10
            }])
        })

        it("should be able to create a new item and get it by id", async () => {
            const response = await server.inject<Item>({
                method: 'POST',
                url: '/items',
                payload: {
                    name: 'Item 1',
                    price: 10
                }
            })
            expect(response.statusCode).toBe(201)
            expect(response.result).toEqual({
                id: expect.any(Number),
                name: 'Item 1',
                price: 10
            })

            const response2 = await server.inject({
                method: 'GET',
                url: `/items/${response.result!.id}`
            })

            expect(response2.statusCode).toBe(200)
            expect(response2.result).toEqual({
                id: expect.any(Number),
                name: 'Item 1',
                price: 10
            })
        })

        it("should be able to update an item", async () => {
            const { result: createdItem } = await server.inject<Item>({
                method: 'POST',
                url: '/items',
                payload: {
                    name: 'Item 1',
                    price: 10
                }
            })

            expect(createdItem).toBeDefined()

            const response = await server.inject({
                method: 'PUT',
                url: `/items/${createdItem!.id}`,
                payload: {
                    name: 'Item 1 updated',
                    price: 20
                }
            })
            expect(response.statusCode).toBe(200)
            expect(response.result).toEqual({
                id: createdItem!.id,
                name: 'Item 1 updated',
                price: 20
            })

            const response2 = await server.inject({
                method: 'GET',
                url: `/items/${createdItem!.id}`
            })
            expect(response2.statusCode).toBe(200)
            expect(response2.result).toEqual({
                id: createdItem!.id,
                name: 'Item 1 updated',
                price: 20
            })
        })

        it("should be able to delete an item", async () => {
            const { result: createdItem } = await server.inject<Item>({
                method: 'POST',
                url: '/items',
                payload: {
                    name: 'Item 1',
                    price: 10
                }
            })

            expect(createdItem).toBeDefined()

            const response = await server.inject({
                method: 'DELETE',
                url: `/items/${createdItem!.id}`
            })
            expect(response.statusCode).toBe(204)

            const response2 = await server.inject({
                method: 'GET',
                url: `/items/${createdItem!.id}`
            })

            expect(response2.statusCode).toBe(404)
        })
    })

    describe("Validations", () => {

        it("should validate required fields", async ()=>{

            const response = await server.inject({
                method: 'POST',
                url: '/items',
                payload: {
                    name: 'Item 1'
                }
            })

            expect(response.statusCode).toBe(400)
            expect(response.result).toEqual({
                errors: [
                    {
                        field: 'price',
                        message: 'Field "price" is required'
                    }
                ]
            })

        })

        it("should not allow for negative pricing for new items", async ()=>{
            const response = await server.inject({
                method: 'POST',
                url: '/items',
                payload: {
                    name: 'Item 1',
                    price: -10
                }
            })

            expect(response.statusCode).toBe(400)
            expect(response.result).toEqual({
                errors: [
                    {
                        field: 'price',
                        message: 'Field "price" cannot be negative'
                    }
                ]
            })
        })

        it("should not allow for negative pricing for updated items", async ()=>{
            const { result: createdItem } = await server.inject<Item>({
                method: 'POST',
                url: '/items',
                payload: {
                    name: 'Item 1',
                    price: 10
                }
            })

            expect(createdItem).toBeDefined()

            const response = await server.inject({
                method: 'PUT',
                url: `/items/${createdItem!.id}`,
                payload: {
                    name: 'Item 1 updated',
                    price: -20
                }
            })

            expect(response.statusCode).toBe(400)
            expect(response.result).toEqual({
                errors: [
                    {
                        field: 'price',
                        message: 'Field "price" cannot be negative'
                    }
                ]
            })
        })
    })

    /* tests extras */
    describe("Additional Validations", () => {
        it("should validate item name is not empty", async () => {
            const response = await server.inject({
                method: 'POST',
                url: '/items',
                payload: {
                    name: '',
                    price: 10
                }
            })
            expect(response.statusCode).toBe(400)
            expect(response.result).toEqual({
                errors: [{
                    field: 'name',
                    message: 'Field "name" is required'
                }]
            })
        })

        it("should validate maximum price limit", async () => {
            const response = await server.inject({
                method: 'POST',
                url: '/items',
                payload: {
                    name: 'Expensive Item',
                    price: 1000000000
                }
            })
            expect(response.statusCode).toBe(400)
        })

        it("should validate item name length", async () => {
            const response = await server.inject({
                method: 'POST',
                url: '/items',
                payload: {
                    name: 'a'.repeat(256),
                    price: 10
                }
            })
            expect(response.statusCode).toBe(400)
        })
    })

    describe("Edge Cases", () => {
    
        it("should handle concurrent item creation", async () => {
            const promises = Array(5).fill(null).map((_, index) => 
                server.inject({
                    method: 'POST',
                    url: '/items',
                    payload: {
                        name: `Concurrent Item ${index}`,
                        price: 10
                    }
                })
            )
            
            const responses = await Promise.all(promises)
            const ids = responses.map(r => r.result.id)
            
            // Verificar que todos los IDs son únicos
            expect(new Set(ids).size).toBe(promises.length)
        })
    
        it("should handle special characters in item names", async () => {
            const response = await server.inject({
                method: 'POST',
                url: '/items',
                payload: {
                    name: 'Item with špécíal chárácters!@#$%^&*()',
                    price: 10
                }
            })
            expect(response.statusCode).toBe(201)
        })
    })

    afterAll(() => {
        return server.stop()
    })
})