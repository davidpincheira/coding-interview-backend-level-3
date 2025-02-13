import { Pool } from 'pg'
import 'dotenv/config'

export const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
})


// Script para crear la tabla
export const createTableQuery = `
    CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL NOT NULL CHECK (price >= 0)
    );
`

// Inicializar la base de datos
export const initializeDatabase = async () => {
    try {
        const client = await pool.connect()
        console.log('Connected to database successfully')
        
        await client.query(createTableQuery)
        console.log('Table initialization completed')
        
        client.release()
    } catch (error) {
        console.error('Error initializing database:', error)
        throw error
    }
}