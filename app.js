const express = require('express')
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/wikiDB');
console.log('Connection started to mongodb on port 27017');

const articleSchema = {
  title: String,
  content: String
}

const Article = mongoose.model('Article', articleSchema);


// Using app.route() with chained methods to avoid duplicate route names (and thus typo errors).
app.route('/articles')
  .get((req, res, next) => {
    Article.find(function(err, articles) {
      if (!err) {
        res.send(articles);
      } else {
        res.send(err);
      }
    });
  })
  .post((req, res, next) => {
    const newArticle = new Article({title: req.body.title, content: req.body.content});
    newArticle.save((err, article) => {
      if (!err) {
        res.send({status: "Successfully added a new article."});
      } else {
        res.send(err);
      }
    });
  })
  .delete((req, res, next) => {
    Article.deleteMany({}, (err)=>{
      if (!err) {
        res.send({status: "Successfully deleted all the articles."});
      } else {
        res.send(err);
      }
    });
  });


// Create a new article using parameters
// app.post('/articles', (req, res) => {
//   const newArticle = new Article({title: req.query.title, content: req.query.content});
//   newArticle.save((err, article) => {
//     if (!err) {
//       res.send({status: "Successfully added a new article."});
//     } else {
//       res.send(err);
//     }
//   })
// })

app.route("/articles/:articleTitle")
  .get((req, res, next)=>{
    Article.findOne({title: req.params.articleTitle}, (err, article)=>{
      if (article){
        res.status(200).send(article);
      } else {
        res.send({error: "No article found for this title!"});
      }
    })
  })
  .put((req, res, next)=>{
    Article.replaceOne(
      {title: req.params.articleTitle},
      {title: req.body.title, content: req.body.content},
      (err)=>{
        if(!err){
          res.status(200).send({success: "Successfully updated the "+req.params.articleTitle+" article"})
        } else {
          res.send(err);
        }
    })
  })
  .patch((req, res)=>{
    Article.updateOne(
      {title:req.params.articleTitle},
      {$set: req.body},
      (err)=>{
      if(!err){
        res.status(200).send({success: "Successfully updated the "+req.params.articleTitle+" article"});
      } else {
        res.send(err);
      }
    })
  })
  .delete((req, res)=>{
    Article.deleteOne({title: req.params.articleTitle}, (err)=>{
      if (!err) {
        res.status(200).send({success: "Successfully deleted the "+req.params.articleTitle+" article!"});
      }
    })
  });





app.listen(3000, function() {
  console.log('the server running on port ' + 3000);
})
