var express = require('express');
const { render } = require('pug');
var router = express.Router();
const {sequelize, Book} = require('../models');
const { Op } = require("sequelize");


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
  
  const books = await Book.findAndCountAll({
    raw: true,
    limit: 5,
    offset: pageOffset,
  });

            
    //
  let pages = books.count / 5;
  let currentPage = parseInt(req.query.page);
  let totalPages = Math.ceil(pages)
  res.render('all-books', { books: books.rows, pages, title: 'Books',  currentPage, totalPages });
}));

//Send a search request to DB
router.post('/books', asyncHandler(async(req, res) => {
  console.log('****** request to BD ******')
  console.log(req.body.search)
  let lookUp = req.body.search.toLowerCase()
  console.log(lookUp)
  const books = await Book.findAll({
    where: {
      [Op.or] : { //find book that match title OR author OR genre OR year (will set the search value to lover and the db value to lower case to match % will match partial matches)
        title: sequelize.where(sequelize.fn('LOWER', sequelize.col('title')), 'LIKE', '%' + lookUp + '%'),
        author: sequelize.where(sequelize.fn('LOWER', sequelize.col('author')), 'LIKE', '%' + lookUp + '%'),
        genre: sequelize.where(sequelize.fn('LOWER', sequelize.col('genre')), 'LIKE', '%' + lookUp + '%'),
        year: sequelize.where(sequelize.fn('LOWER', sequelize.col('year')), 'LIKE', '%' + lookUp + '%'),
      }
    }
  })
  console.log(books)
  res.render('all-books', { title:"Search", books})
}))


//SHOW create new book form 
router.get('/books/new', asyncHandler(async(req, res) => {
  res.render('new-book')
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
      res.render('form-error', { book, error: error.errors })
    } else {
      res.sendStatus(404)
    }
    console.log(error.name)
  }
}));

//SHOW book detail form
router.get('/books/:id', asyncHandler(async(req, res, next) => {
  let book = await Book.findByPk(req.params.id)
  if(book){
    console.log(book)
    book = await Book.findByPk(req.params.id,{raw: true})
    res.render('book-detail', { book })
  } else {
    throw new Error('Page Not Found')
  }
  
  
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
      res.render("book-detail", { book, error: error.errors })
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

module.exports = router;
