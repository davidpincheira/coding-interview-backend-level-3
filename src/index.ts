import { startServer, initializeServer } from "./server"

process.on('unhandledRejection', (err) => {
    console.error(err)
    process.exit(1)
})

void startServer().catch(err => {
    console.error(err)
    process.exit(1)
})