const _ = require('lodash')
const db = require('../db')
const fs = require('fs')
const Book = require('../models/Book')
const { UPLOAD_PATH } = require('../utils/constant')
const init = require('../utils/init')

function exists(book) {
  const { title, author, publisher } = book
  const sql = `select * from book where title='${title}' and author='${author}' and publisher='${publisher}'`
  return db.queryOne(sql)
}

async function removeBook(book) {
  if (book) {
    book.reset()
    if (book.fileName) {
      const removeBookSql = `delete from book where fileName='${book.fileName}'`
      const removeContentsSql = `delete from contents where fileName='${book.fileName}'`
      await db.querySql(removeBookSql)
      await db.querySql(removeContentsSql)
    }
  }
}

async function insertContents(book) {
  let contents = book.getContents()
  if (!contents) {
    const newBook = await book.parse()
    contents = newBook.getContents()
  }
  if (contents && contents.length > 0) {
    for (let i = 0; i < contents.length; i++) {
      const content = contents[i]
      const _content = _.pick(content, [
        'fileName',
        'id',
        'href',
        'order',
        'level',
        'text',
        'label',
        'pid',
        'navId'
      ])
      await db.insert(_content, 'contents')
    }
  }
}

function insertBook(book) {
  return new Promise(async (resolve, reject) => {
    try {
      if (book instanceof Book) {
        const result = await exists(book)
        if (result) {
          await removeBook(book)
          reject(new Error('电子书已存在'))
        } else {
          await db.insert(book.toDb(), 'book')
          await insertContents(book)
          resolve()
        }
      } else {
        reject(new Error('添加的图书对象不合法'))
      }
    } catch (e) {
      reject(e)
    }
  })
}

function updateBook(book) {
  return new Promise(async (resolve, reject) => {
    try {
      if (book instanceof Book) {
        const result = await getBook(book.fileName)
        if (result) {
          const model = book.toDb()
          if (Number(result.updateType) === 0) {
            reject(new Error('默认图书不能编辑'))
          } else {
            delete model.createDt // 创建时间不能更新
            if (result.createUser !== book.createUser) {
              reject(new Error('只有创建人才能编辑'))
            } else {
              await db.update(model, 'book', `where fileName='${book.fileName}'`)
              resolve()
            }
          }
        } else {
          reject(new Error('电子书不存在'))
        }
      } else {
        reject(new Error('添加的图书对象不合法'))
      }
    } catch (e) {
      reject(e)
    }
  })
}

function deleteBook(fileName) {
  return new Promise(async (resolve, reject) => {
    try {
      let book = await getBook(fileName)
      if (book) {
        if (Number(book.updateType) === 0) {
          reject(new Error('默认电子书不能删除'))
        } else {
          const bookObj = new Book(null, book)
          const sql = `DELETE FROM book WHERE fileName='${fileName}'`
          db.querySql(sql).then(() => {
            bookObj.reset()
            resolve()
          })
        }
      } else {
        reject(new Error('电子书不存在'))
      }
    } catch (e) {
      reject(e)
    }
  })
}

async function getBook(fileName) {
  const bookSql = `select * from book where fileName='${fileName}'`
  const contentsSql = `select * from contents where fileName='${fileName}' order by \`order\` asc`
  const book = await db.queryOne(bookSql)
  const contents = await db.querySql(contentsSql)
  if (book) {
    book.cover = Book.genCoverUrl(book)
    book.contents = contents
    book.contentsTree = []
    contents.forEach(_ => _.children = [])
    contents.forEach(c => {
      if (c.pid === '') {
        book.contentsTree.push(c)
      } else {
        const parent = contents.find(_ => _.navId === c.pid)
        parent.children.push(c)
      }
    }) // 将目录转化为树状结构
    return book
  } else {
    throw new Error('电子书不存在')
  }
}

function clearUploadDir() {
  fs.rmdirSync(`${UPLOAD_PATH}/book`, { recursive: true })
  fs.rmdirSync(`${UPLOAD_PATH}/img`, { recursive: true })
  fs.rmdirSync(`${UPLOAD_PATH}/unzip`, { recursive: true })
}

async function clear() {
  const sql = 'select * from book where updateType=1'
  const results = await db.querySql(sql)
  results.forEach(data => {
    const book = new Book(null, data)
    removeBook(book)
  })
  clearUploadDir() // 清空文件夹
  init() // 重新初始化文件夹
}

async function listBook(p) {
  const {
    page = 1,
    pageSize = 20,
    sort,
    title,
    category,
    author
  }
  = p;
  const offset = (page - 1) * pageSize;
  let bookSql = 'select * from book'
  let where = 'where'
  title && (where = db.andLike(where, 'title', title))
  author && (where = db.andLike(where, 'author', author))
  category && (where = db.and(where, 'categoryText', category))
  if (where !== 'where') {
    bookSql = `${bookSql} ${where}`
  }
  if (sort) {
    const symbol = sort[0]
    const column = sort.slice(1, sort.length)
    const order = symbol === '+' ? 'asc' : 'desc'
    bookSql = `${bookSql} order by ${column} ${order}`
  }
  bookSql = `${bookSql} limit ${pageSize} offset ${offset}`
  let countSql = `select count(*) as count from book`
  if (where !== 'where') {
    countSql = `${countSql} ${where}`
  }
  const list = await db.querySql(bookSql)
  console.log(bookSql, '\n', countSql)
  list.forEach(book => book.cover = Book.genCoverUrl(book))
  const count = await db.querySql(countSql)
  return { list, count: count[0].count, page, pageSize }
}

async function getCategory() {
  const sql = 'select * from category order by category asc'
  const result = await db.querySql(sql)
  const categoryList = []
  result.forEach(item => {
    categoryList.push({
      label: item.categoryText,
      value: item.category,
      num: item.num
    })
  })
  return categoryList
}

function home() {
  const userSql = 'select count(*) as count from user'
  const bookSql = 'select count(*) as count from book'
  const shelfSql = 'select count(*) as count from shelf'
  const rankSql = 'select count(*) as count from rank'
  return Promise.all([
    db.querySql(userSql),
    db.querySql(bookSql),
    db.querySql(shelfSql),
    db.querySql(rankSql)
  ]).then(results => {
    const user = results[0][0].count
    const book = results[1][0].count
    const shelf = results[2][0].count
    const rank = results[3][0].count
    return { user, book, shelf, rank }
  })
}

module.exports = {
  insertBook,
  getBook,
  listBook,
  clear,
  getCategory,
  updateBook,
  deleteBook,
  home
}
