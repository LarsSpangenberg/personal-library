/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        expect(err, 'DB connection error').to.not.exist;
        let collection = db.collection('books');
        collection.find().toArray(function(err, wr) {
          expect(err, 'DB find error').to.not.exist;
          expect(wr).to.exist.and.to.be.an('array');
          wr.forEach(function(book, i) {
            book.commentcount = book.comments.length;
            delete book.comments;
          });
          res.json(wr)
        });
      });
    })
    
    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including at least _id and title
      if(!title) {
        return res.send('missing title');
      }
      expect(title, 'posted title').to.be.a('string');
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        expect(err, 'DB connection error').to.not.exist;
        let collection = db.collection('books');
        let book = {title, comments: []};
        collection.insert(book, function(err, wr) {
          expect(err, 'DB insert error').to.not.exist;
          res.json(wr.ops[0]);
        });
      });
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        expect(err, 'DB connection error').to.not.exist;
        let collection = db.collection('books');
        collection.remove();
        res.send('complete delete successful');
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = new ObjectId(req.params.id);
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        expect(err, 'DB connection error').to.not.exist;
        let collection = db.collection('books');
        collection.findOne({_id: bookid}, function(err, doc) {
          expect(err, 'DB find error').to.not.exist;
          if(!doc) { 
            res.send('no book exists');
          } else {
            res.json(doc);
          }
        });
      });
    })
    
    .post(function(req, res){
      var bookid = new ObjectId(req.params.id);
      var comment = req.body.comment;
      //json res format same as .get
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        expect(err, 'DB connection error').to.not.exist;
        let collection = db.collection('books');
        collection.findOneAndUpdate(
          {_id: bookid}, 
          {$push: {comments: comment}},
          {upsert: false, returnOriginal: false},
          function(err, doc) {
            expect(err, 'DB update error').to.not.exist;
            res.json(doc.value);
          });
      });
    })
    
    .delete(function(req, res){
      var bookid = new ObjectId(req.params.id);
      //if successful response will be 'delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        expect(err, 'DB connection error').to.not.exist;
        let collection = db.collection('books');
        collection.findOneAndDelete({_id: bookid}, function(err, doc) {
          expect(err, 'DB find and delete error').to.not.exist;
          res.send('delete successful');
        });
      });
    });
  
};
