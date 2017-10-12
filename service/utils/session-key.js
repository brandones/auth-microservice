//utils/session-key.js

var md5 = require('md5');
var config = require('../config')

var JWT_JTI_SALT = config.get('jwt:salt')

function generate(userId, deviceId, issuedAt) {
  return md5('' + userId + deviceId + issuedAt + JWT_JTI_SALT)
}

module.exports = generate
