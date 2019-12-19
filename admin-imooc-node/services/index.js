const db = require('../db')
const boom = require('boom')

function queryOne(sql, next) {
  const promise = new Promise((resolve, reject) => {
    db.querySql(sql)
      .then(results => {
        if (results && results.length > 0) {
          resolve(results[0])
        } else {
          resolve(null)
        }
      })
      .catch(error => {
        reject(error)
      })
  })
  return sqlWrapper(promise, next)
}

function querySql(sql, next) {
  return sqlWrapper(db.querySql(sql), next)
}

function sqlWrapper(promise, next) {
  return new Promise((resolve, reject) => {
    promise
      .then(results => {
        resolve(results)
      })
      .catch(error => {
        if (next) {
          next(boom.notImplemented(error))
        } else {
          reject(error)
        }
      })
  })
}

module.exports = {
  querySql,
  queryOne
}
