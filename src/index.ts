import { startServer, initializeServer } from "./server"

process.on('unhandledRejection', (err) => {
    console.error(err)
    process.exit(1)
})

const start = async () => {
    try {
        await initializeServer()
        await startServer()
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

// Ejecutamos la función principal
void start()