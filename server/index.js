const path = require('path')
const express = require('express')
const morgan = require('morgan')
const compression = require('compression')
const PORT = process.env.PORT || 8080
const app = express()
const socketio = require('socket.io')
// telling our server to load anything in a .env file to an environment var
require('dotenv').config()
module.exports = app

const createApp = () => {
    //logging middleware
    app.use(morgan('dev'))

    //body parsing middleware
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    //compression middleware
    app.use(compression())

    //static file-serving middleware
    app.use(express.static(path.join(__dirname, '..', 'public')))

    //any remaining requests get sent to 404
    app.use((req, res, next) => {
        if (path.extname(req.path).length) {
            const err = new Error('Not Found')
            err.status = 404
            next(err)
        } else {
            next()
        }
    })
    //sends index.html
    app.use('*', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'public/index.html'))
    })

    // error handling endware
    app.use((err, req, res, next) => {
        console.error(err)
        console.error(err.stack)
        res.status(err.status || 500).send(err.message || 'Internal Server Error.')
    })
}

const startListening = () => {
    const server = app.listen(PORT, () =>
        console.log(`Mixing it up on port ${PORT}`)
    )

    const io = socketio(server)
    require('./socket')(io)
}

async function bootApp() {
    await createApp()
    await startListening()
}

//This evaluates as true when this file is directly from the command line
//i. e. when we say 'node server/index.js' it will evaluate as false when this module is required by a nother module
//for example if we wanted to require our app in a test spec
// if (require.main === module) {
//     bootApp()
// } else {
//     createApp()
// }

bootApp()
