import { pool } from '../config/database'
import { Item, CreateItemDTO, UpdateItemDTO } from '../models/Item'

export class ItemRepository {
    async create(item: CreateItemDTO): Promise<Item> {
        const { rows } = await pool.query(
            'INSERT INTO items (name, price) VALUES ($1, $2) RETURNING id, name, CAST(price AS INTEGER) as price',
            [item.name, item.price]
        )
        return rows[0]
    }

    async findAll(): Promise<Item[]> {
        const { rows } = await pool.query('SELECT * FROM items')
        return rows
    }

    async findById(id: number): Promise<Item | null> {
        const { rows } = await pool.query(
            'SELECT * FROM items WHERE id = $1',
            [id]
        )
        return rows[0] || null
    }

    async update(id: number, item: UpdateItemDTO): Promise<Item | null> {
        const { rows } = await pool.query(
            'UPDATE items SET name = $1, price = $2 WHERE id = $3 RETURNING id, name, CAST(price AS INTEGER) as price',
            [item.name, item.price, id]
        )
        return rows[0] || null
    }

    async delete(id: number): Promise<boolean> {
        const { rowCount } = await pool.query(
            'DELETE FROM items WHERE id = $1',
            [id]
        )
        return (rowCount ?? 0) > 0
    }

    async findByPriceRange(min: number, max: number): Promise<Item[]> {

        const { rows } = await pool.query(
            'SELECT * FROM items WHERE price BETWEEN $1 AND $2',
            [min, max]
        )
        return rows
        
    }
}