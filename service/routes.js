// Authentication Service API endpoints

const _ = require('underscore')
const express = require('express')
const router = express.Router()
const R = require('ramda')
const promisify = require('es6-promisify')

const models = require('./models')
const User = models.User
const KeyService = require('./key-service')

const trimmedParams = (body, names) => R.map(R.trim, R.pick(names, body))

// Register
router.post('/users', async function(req, res, next) {
  try {
    console.log(req.header('content-type'))
    console.log(req.body)
    const { username, password } =
      trimmedParams(req.body, ['username', 'password'])
    if (!username || !password) {
      return res.status(400).send({
        error: 'Username and password are required parameters.'
      })
    }
    const user = await User.findOne({ username })
    if (user) {
      return res.status(409).send({
        error: 'User with that username already exists.'
      })
    }
    try {
      const user = new User({ username })
      const setPassword = promisify(user.setPassword, user)
      await setPassword(password)
      const savedUser = await user.save()
      res.status(201).send(user)
    } catch (e) {
      console.log(e)
      res.status(400).send(e)
    }
  } catch (e) {
    console.log(e)
    res.sendStatus(500)
  }
})

// Login
router.post('/sessions', async function(req, res, next) {
  const { username, password, deviceId } =
    trimmedParams(req.body, ['username', 'password', 'deviceId'])
  if (!username || !password || !deviceId) {
    return res.status(400).send({
      error: 'username, password, and deviceId are required parameters'
    })
  }
  const user = await User.findOne({ username })
  if (!user) {
    return res.status(404).send({error: 'User does not exist'})
  }
  const passwordMatch = await user.authenticate(password)
  if (!passwordMatch) {
    return res.status(403).send({ error: 'Incorrect password' })
  }
  try {
    const token = await KeyService.set(userResult, params.deviceId)
    res.status(200).send({ accessToken: token })
  } catch (error) {
    console.log(error)
    next(error)
  }
})

// Get Session
router.get('/sessions/:sessionKey', async function(req, res, next) {
  try {
    const { sessionKey } = req.params
    if (!sessionKey) {
      return res.status(400).send({error: 'sessionKey is a required parameters'})
    }
    const result = await KeyService.get(sessionKey)
    if (_.isNull(result)) {
      return res.status(404).send({error: 'Session does not exist or has ' +
                                  'expired. Please sign in to continue.'})
    }
    res.status(200).send({userKey: result})
  } catch (e) {
    console.log(e)
    res.sendStatus(500)
  }
})

// Logout
router.delete('/sessions/:sessionKey', function(req, res, next) {
  const sessionKey = req.params.sessionKey
  if (!sessionKey) {
    return res.status(400).send({error: 'sessionKey is a required parameter'})
  }

  KeyService.delete(sessionKey)
    .then(function(result) {
      if (!result) {
        return res.status(404).send()
      }
      res.status(204).send()
    })
    .catch(function(error) {
      console.log(error)
      next(error)
    })
})

module.exports = router
