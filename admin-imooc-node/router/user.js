const express = require('express')
const jwt = require('jsonwebtoken')
const boom = require('boom')
const { body, validationResult } = require('express-validator')
const Result = require('../models/Result')
const userService = require('../services/user')
const {
  PWD_SALT,
  PRIVATE_KEY,
  JWT_EXPIRED
} = require('../utils/constant')
const { md5, decode } = require('../utils')

const router = express.Router()

router.post(
  '/login',
  [
    body('username').isString().withMessage('username类型不正确'),
    body('password').isString().withMessage('password类型不正确')
  ],
  async function(req, res, next) {
    const err = validationResult(req)
    if (!err.isEmpty()) {
      const [{ msg }] = err.errors
      next(boom.badRequest(msg))
    } else {
      const username = req.body.username
      const password = md5(`${req.body.password}${PWD_SALT}`)
      const user = await userService.login({ username, password }, next)
      if (user) {
        const token = jwt.sign(
          { username },
          PRIVATE_KEY,
          { expiresIn: JWT_EXPIRED }
        )
        new Result({ token }, '登录成功').success(res)
      } else {
        new Result(null, '用户名或密码不存在').fail(res)
      }
    }
  }
)

router.get('/info', async function(req, res, next) {
  const decoded = decode(req)
  if (decoded && decoded.username) {
    const user = await userService.findUser({ username: decoded.username }, next)
    if (user) {
      delete user.password
      user.roles = [user.role]
      new Result(user, '获取用户信息成功').success(res)
    } else {
      new Result(null, '获取用户信息失败').fail(res)
    }
  } else {
    new Result(null, '用户信息解析失败').fail(res)
  }
})

module.exports = router
