//utils/jwt.js

var _ = require('underscore')
var jsrsasign = require('jsrsasign')

var config = require('../config')
var sessionKey = require('../utils/session-key')
var JWT_ENCODING_ALGORITHM = config.get('jwt:algorithm')
var JWT_SECRET_SEPARATOR = config.get('jwt:secret_separator')

function JWT() {
  this.secretKey = config.get('jwt:secret')
}

// Generate a new JWT
JWT.prototype.generate = function(user, deviceId, userKey, issuedAt,
                                  expiresAt) {
  if (!user.id || !user.username) {
    throw new Error('user.id and user.username are required parameters')
  }

  var header = {
    alg: JWT_ENCODING_ALGORITHM, typ: 'JWT'
  }
  var payload = {
    username: user.username,
    deviceId: deviceId,
    jti: sessionKey(user.id, deviceId, issuedAt),
    iat: issuedAt,
    exp: expiresAt
  }
  var secret = this.secret(userKey)
  var token = jsrsasign.jws.JWS.sign(JWT_ENCODING_ALGORITHM,
                         JSON.stringify(header),
                         JSON.stringify(payload),
                         secret)
  return token
}

// Token Secret generation
JWT.prototype.secret = function(userKey) {
  return this.secretKey + JWT_SECRET_SEPARATOR + userKey
}

module.exports = new JWT()
