const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const rfs = require('rotating-file-stream')
const config = require('./api/config')
const router = require('./api/route')
const app = express()

// parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))
// for parsing application/json
app.use(express.json())
// for parsing multipart/form-data
app.use(express.static(config.publicDir))

// create a write stream (in append mode)
// const accessLogStream = fs.createWriteStream(path.join(__dirname, 'request.log'), { flags: 'a' })
// create a rotating write stream
const accessLogStream = rfs.createStream('request.log', {
    interval: '1d', // rotate daily
    path: config.logDir
})

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }))

app.use(cors({
    origin: ['http://localhost', 'http://localhost:3000', 'http://localhost:8080'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    // credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}))

// define all router
app.use(router)

app.listen(config.port, (err) => {
    if (err) {
        console.error(`server error`)
    } else {
        console.log(`App is up and running for ${config.env} environment | PORT: ${config.port}`)
    }
})