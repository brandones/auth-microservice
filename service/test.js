const expect = require('unexpected')
const request = require('supertest')

const app = require('./index')
var config = require('./config')

const mongoose = require('mongoose')
mongoose.models = {}
mongoose.modelSchemas = {}
mongoose.promise = global.promise
mongoose.connect(`mongodb://${config.get('mongo:host')}`,
  { server: { reconnectTries: Number.MAX_VALUE } })

const models = require('./models')
const User = models.User

const makePost = (route, body) => {
  return request(app)
    .post(route)
    .set('Content-Type', 'application/json')
    .send(body)
}

describe('POST users', () => {
  const post = (body) => makePost('/users', body)

  beforeEach(async () => {
    await User.remove({})
  })

  it('should 201', async function() {
    const body = { username: 'foo', password: 'bar' }
    const res = await post(body)
    console.log(res.body)
    expect(res.statusCode, 'to be', 201)
  })

  it('should create a new user', async function() {
    const body = {
      username: 'foo',
      password: 'bar'
    }
    await post(body)
    const user = await User.findOne({ username: body.username })
    console.log(user)
    expect(user, 'not to be null')
  })

  it('should not store passwords as plaintext', async () => {
    const body = { username: 'foo', password: 'bar' }
    await post(body)
    const user = await User.findOne({ username: body.username })
    console.log(user)
    expect(user.password, 'not to be', body.password)
  })

  it('shouldn\'t allow two users with the same username', async () => {
    await post({ username: 'foo', password: 'bar' })
    const res = await post({ username: 'foo', password: 'baz' })
    expect(res.statusCode, 'to be', 409)
  })

})

describe('POST sessions', () => {
  const post = (body) => makePost('/sessions', body)
  const user = {
    username: 'foo',
    password: 'bar'
  }

  beforeEach(async () => {
    await User.remove({})
    await request(app).post('/users').type('form').send(user)
  })

  it('should 200', async () => {
    const res = await post(user)
    console.log(res.body)
    expect(res.statusCode, 'to be', 200)
  })
})
