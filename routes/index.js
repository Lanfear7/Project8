var express = require('express');
var router = express.Router();
const Books = require('../models/').Book;

function asyncHandler(cb){
  return async(req, res, next) => {
    try{
      await cb(req, res, next)
    }catch(error){
      next(error)
    }
  }
}

/* GET home page. */
router.get('/', asyncHandler(async(req, res, next) => {
  res.redirect('/books')
  //res.render('../views/index', {title: 'SQL'})
}));

//book route to display all the books from the DB
router.get('/books', asyncHandler(async(req, res, next) => {
  console.log('******** Books path ********')
  const books = await Books.findAll({
    raw: true
  })
  res.json(books)
}));

//SHOW create new book form 
router.get('/books/new', asyncHandler(async(req, res, next) => {
  console.log('****** New Book ******')
}));

//POSTS a new book to the DB
router.post('/books/new', asyncHandler(async(req, res, next) => {
  console.log('*** POST Book ***')
}));

//SHOW book detail form
router.get('/books/:id', asyncHandler(async(req, res, next) => {
  console.log('****** Book Details ******')
  const book = await Books.findByPk(req.params.id)
  res.json(book)
}));

//UPDATE book details
router.post('/books/:id', asyncHandler(async(req, res, next) => {
  console.log('*** POST Details***')
}));

//DELETE books from DB
router.post('/books/:id/delete', asyncHandler(async(req, res, next) => {
  console.log('****** DELETE Book ******')
}))

module.exports = router;
