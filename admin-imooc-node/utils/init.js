const fs = require('fs')
const { UPLOAD_PATH } = require('../utils/constant')

function init() {
  const dir = `${UPLOAD_PATH}/book`
  const unzipDir = `${UPLOAD_PATH}/unzip`
  const imgDir = `${UPLOAD_PATH}/img`
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (!fs.existsSync(unzipDir)) {
    fs.mkdirSync(unzipDir, { recursive: true })
  }
  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true })
  }
}

module.exports = init
