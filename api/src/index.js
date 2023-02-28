const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
const port = 3000

dotenv.config()

// middlewares
app.use(morgan('dev'))
app.use(express.json())
app.use(cors())

app.listen(port, () => {
  console.log(`[port: ${port}] server running...`)
})
