const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");
const app =express();
mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/moviesDB', {
  useNewUrlParser: true
});
const movieSchema = new mongoose.Schema({
  title : String
});
const Movie = mongoose.model("Movie" ,movieSchema);
const movie1 = new Movie({
  title : "Bahubali"
});
const movie2 = new Movie({
  title : "KGF"
});
const movie3 = new Movie({
  title : "Robo"
});
const defaultMovies = [movie1 ,movie2 , movie3];
const listSchema = new mongoose.Schema({
  title : String ,
  items : [movieSchema]
})
const List = mongoose.model("List", listSchema );
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set("view engine" ,"ejs");
app.use(express.static("public"));
const day = new Date();
const options = {
  weekday : "long"
};
const today = day.toLocaleDateString("en-US" , options);
app.get("/",function(req,res){
  Movie.find({},function(err,foundMovie){
    if(foundMovie.length === 0){
      Movie.insertMany(defaultMovies,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("success");
        }
        res.redirect("/");
      })
    }else{
      res.render("list",{headingName : today , addedMovie: foundMovie})
    }
  })

})
app.get("/:randomLanguage",function(req,res){
  const randomLanguage = _.capitalize(req.params.randomLanguage);
  List.findOne({title : randomLanguage} ,function(err,foundMovies){
    if(!err){
      if(!foundMovies){
        const newList = new List({
          title : randomLanguage,
          items : defaultMovies
        });
        newList.save();
        res.redirect("/" + randomLanguage);
      }else{
        res.render("list" , { headingName : randomLanguage , addedMovie : foundMovies.items})
      }
    }
  })
})
app.post("/",function(req,res){
  const newFilm = req.body.newitem;
  const language =req.body.button;
  const movie = new Movie({
    title : newFilm
  });
  if ( language === today){
    movie.save();
    res.redirect("/");
  }else{
    List.findOne({ title : language} ,function(err,foundList){
      if(foundList){
        foundList.items.push(movie);
        foundList.save();
        res.redirect("/" + language);
      }
    })
  }
})
app.post("/delete",function(req,res){
  const checkedId = req.body.checked;
  const newList = req.body.newList;
  if( today === newList){
    Movie.findByIdAndDelete(checkedId,function(err){
      if(!err){
        res.redirect("/")
    }})
  }else{
    List.findOneAndUpdate({title : newList} , {$pull :{items: { _id : checkedId}}}, function(err){
      if(!err){
        res.redirect("/" + newList)
      }
    })
  }
})

app.listen(3000,function(req,res){
  console.log("server is working");
})
