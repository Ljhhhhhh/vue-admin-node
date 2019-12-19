const {
  CODE_ERROR,
  CODE_SUCCESS
} = require('../utils/constant')

class Result {
  constructor(data, msg = '操作成功', options) {
    this.data = data
    this.msg = msg
    if (options) {
      this.options = options
    }
  }

  createResult() {
    if (!this.code) {
      this.code = CODE_SUCCESS
    }
    let base = {
      code: this.code,
      data: this.data,
      msg: this.msg
    }
    if (this.options) {
      base = { ...base, ...this.options }
    }
    return base
  }

  json(res) {
    res.json(this.createResult())
  }

  success(res) {
    this.code = CODE_SUCCESS
    this.json(res)
  }

  fail(res) {
    this.code = CODE_ERROR
    this.json(res)
  }
}

module.exports = Result
