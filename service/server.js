const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const routes = require('./routes')
var config = require('./config')

const app = express()

mongoose.promise = global.promise
mongoose.connect(`mongodb://${config.get('mongo:host')}`,
  { server: { reconnectTries: Number.MAX_VALUE } })

app.use(morgan('combined'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', routes)

const port = config.get('port')
if (!module.parent) {  // this check required for supertest
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
  })
}

module.exports = app  // required for supertest

