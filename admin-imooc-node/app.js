const express = require('express')
const logger = require('morgan')
const router = require('./router/index.js')
const bodyParser = require('body-parser')
const cors = require('cors')
const https = require('https')
const fs = require('fs')
const init = require('./utils/init')

init()
const app = express()

app.use(cors())
app.use(logger('dev'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use('/', router)

const server = app.listen(5000, function() {
  const host = server.address().address
  const port = server.address().port

  console.log('HTTP Server is running on http://%s:%s', host, port)
})
const privateKey = fs.readFileSync('https/book_youbaobao_xyz.key', 'utf8')
const certificate = fs.readFileSync('https/book_youbaobao_xyz.pem', 'utf8')
const credentials = { key: privateKey, cert: certificate }
const httpsServer = https.createServer(credentials, app)
const SSLPORT = 18082
httpsServer.listen(SSLPORT, function() {
  console.log('HTTPS Server is running on: https://localhost:%s', SSLPORT)
})

process.on('uncaughtException', function(err) {
  console.log('uncaughtException', err)
})

const unhandledRejections = new Map();
process.on('unhandledRejection', (reason, promise) => {
  unhandledRejections.set(promise, reason);
})
