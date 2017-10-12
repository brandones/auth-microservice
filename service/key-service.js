// key-service.js, a key storage backed by Redis

// KeyService stores and manages user-specific keys used to sign JWTs
const uuid = require('uuid')
const promisifyAll = require('es6-promisify-all')
const redis = require('redis')

const config = require('./config')
const JWT = require('./utils/jwt')
const EXPIRATION_TIME = config.get('key_service:expires_seconds')
const sessionKey = require('./utils/session-key')

promisifyAll(redis.RedisClient)

function KeyService() {
  this.client = redis.createClient(config.get('key_service:port'),
                                   config.get('key_service:host'))
  this.client.on('connect', function() {
    console.log('Redis connected.')
  })
  console.log('Connecting to Redis...')
}

// Retrieve a JWT user key
KeyService.prototype.get = function(sessionKey) {
  return this.client.getAsync(sessionKey)
}

// Generate and store a new JWT user key
KeyService.prototype.set = function(user, deviceId) {
  const userKey = uuid.v4()
  const issuedAt = new Date().getTime()
  const expiresAt = issuedAt + (EXPIRATION_TIME * 1000)

  const token = JWT.generate(user, deviceId, userKey, issuedAt, expiresAt)
  const key = sessionKey(user.id, deviceId, issuedAt)

  const setKey = this.client.setAsync(key, userKey)
  const setExpiration = setKey.then(this.client.expireAsync(key,
                                  EXPIRATION_TIME))
  const getToken = setExpiration.then(function() {
    return token
  })

  return getToken
}

// Manually remove a JWT user key
KeyService.prototype.delete = function(sessionKey) {
  return this.client.delAsync(sessionKey)
}

module.exports = new KeyService()
