var express = require('express');
const { render } = require('pug');
var router = express.Router();
const {sequelize, Book} = require('../models');
const querystring = require('querystring');


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
  res.redirect(301, '/books?page=1') //301 redirect is good SEO practice 
}));

//book route to display all the books from the DB
router.get('/books', asyncHandler(async(req, res) => {
  let setUp = parseInt(req.query.page) - 1
  let pageOffset = setUp * 5
  
  const books = await Book.findAndCountAll({raw: true,
                                            limit: 5,
                                            offset: pageOffset,
                                            });

            
    //
  let pages = books.count / 5;
  let currentPage = parseInt(req.query.page);
  let totalPages = Math.ceil(pages)
  res.render('all_books', { books: books.rows, pages, title: 'Books',  currentPage, totalPages });
}));


//SHOW create new book form 
router.get('/books/new', asyncHandler(async(req, res) => {
  res.render('new_book')
}));

//POSTS a new book to the DB
router.post('/books/new', asyncHandler(async(req, res) => {
  let book;
  try{
    book = await Book.create(req.body); //create new book with the date entered by the user
    res.redirect(301, '/'); //after book is created send user to /books
  }catch(error){
    if(error.name === "SequelizeValidationError"){ 
      book = Book.build(req.body) //build the data from the data previously entered 
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
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if(book) {
      await book.update(req.body);
      res.redirect(301, "/"); 
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id; // make sure correct article gets updated
      res.render("book_detail", { book, error: error.errors })
    } else {
      throw error;
    }
  }
}));

//DELETE books from DB
router.post('/books/:id/delete', asyncHandler(async(req, res) => {
  const book = await Book.findByPk(req.params.id)
  await book.destroy()
  res.redirect(301, '/')
}))

//pagination middleware 
function pageUp(req, res){
  console.log('page up******')
}

function pageDown(req, res){
  console.log('page down*****')
}


module.exports = router;
