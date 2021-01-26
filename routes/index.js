var express = require('express');
const { render } = require('pug');
var router = express.Router();
const {sequelize, Book} = require('../models');

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // Forward error to the global error handler
      next(error);
    }
  }
}

/* GET home page. */
router.get('/', asyncHandler(async(req, res) => {
  res.redirect(301, '/books') //good SEO practice 
  //res.render('../views/index', {title: 'SQL'})
}));

//book route to display all the books from the DB
router.get('/books', asyncHandler(async(req, res) => {
  const books = await Book.findAll({raw: true});
  console.log(books)
  res.render('all_books', { books, title: 'Books' });
}));

//SHOW create new book form 
router.get('/books/new', asyncHandler(async(req, res) => {
  res.render('new_book')
}));

//POSTS a new book to the DB
router.post('/books/new', asyncHandler(async(req, res) => {
  let book;
  try{
    book = await Book.create(req.body);
    res.redirect(301, '/books');
  }catch(error){
    if(error.name === "SequelizeValidationError"){
      book = Book.build(req.body)
      console.log(error.errors)
      res.render('form_error', { book, error: error.errors })
    } else {
      res.sendStatus(404)
    }
    console.log(error.name)
  }
  
  
}));

//SHOW book detail form
router.get('/books/:id', asyncHandler(async(req, res) => {
  const book = await Book.findByPk(req.params.id,{raw: true})
  res.render('book_detail', { book })
}));

//UPDATE book details
router.post('/books/:id', asyncHandler(async(req, res) => {
  const book = await Book.findByPk(req.params.id)
  await book.update(req.body)
  res.redirect(301, '/books/new')
}));

//DELETE books from DB
router.post('/books/:id/delete', asyncHandler(async(req, res) => {
  const book = await Book.findByPk(req.params.id)
  await book.destroy()
  res.redirect(301, '/books')
}))

module.exports = router;
