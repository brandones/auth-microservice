const nconf = require('nconf')

function Config() {

  nconf.overrides({
  })

  nconf.argv().env()

  nconf.file('./config.json')

  nconf.defaults({
    'port': 4005,
    'jwt': {
      'algorithm': 'HS256',
      'secret_separator': '.',
      'secret': 'temp-jwt-secret',
      'salt': 'less-secret-stuff'
    },
    'mongo': {
      'host': 'localhost'
    }
  })

  nconf.required(['jwt:secret', 'jwt:salt'])
}

Config.prototype.get = function(key) {
  return nconf.get(key)
}

module.exports = new Config()

