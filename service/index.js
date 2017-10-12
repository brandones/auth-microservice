const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const routes = require('./routes')
var config = require('./config')

const app = express()

app.use(morgan('combined'))
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/', routes)

const port = config.get('port')
if (!module.parent) {  // this check required for supertest
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
  })
}

module.exports = app  // required for supertest

