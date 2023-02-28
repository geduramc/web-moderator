const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const cors = require('cors')
// const mongoose = require('mongoose')
const routes = require('./routes/routes')

require('dotenv').config()

const app = express()

app.set('port', (process.env.PORT != null) ? process.env.PORT : 3000)

// middlewares
app.use(morgan('dev'))
app.use(express.json())
app.use(cors())

//routes
routes(app)

app.listen(app.get('port'), () => {
  console.log(`[port: ${app.get('port')}] server running...`)
})
