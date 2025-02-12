import Hapi from '@hapi/hapi'
import { itemRoutes } from './routes/itemRoutes'
import { initializeDatabase } from './config/database'

const getServer = () => {
    const server = Hapi.server({
        host: 'localhost',
        port: 3000,
    })

    itemRoutes(server)

    return server
}

export const initializeServer = async () => {
    await initializeDatabase()
    const server = getServer()
    await server.initialize()
    return server
}

export const startServer = async () => {
    const server = getServer()
    await server.start()
    console.log(`Server running on ${server.info.uri}`)
    return server
};