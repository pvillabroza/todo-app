
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();
const port = 3000;
const db = "todoListDB";

let todos = ["Buy Rigs", "Setup Rigs", "Data Mining"];
let works = [];

app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

//mongodb://localhost:27017/
mongoose.connect("mongodb+srv://admin-paolo:P@ssw0rd@cluster0.53p3v.mongodb.net/"+db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const itemSchema = new mongoose.Schema({
  name: {
    type: String
  }
});

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Value"]
  },
  list: [itemSchema]
});

const Item = mongoose.model("Item", itemSchema);

const List = mongoose.model("List", listSchema);

let currentDate = date.getDate();

const item1 = new Item({
  name: "Buy Rigs"
});

const item2 = new Item({
  name: "Setup Rigs"
});

const item3 = new Item({
  name: "Data Mining"
});

const defaultItems = [item1, item2, item3];

//Default List
app.get("/", function(req, res){

  Item.find(function(err, docs){

    if(err){
      console.log(err);
    } else {

      if (docs.length === 0){
        Item.insertMany(defaultItems, function(err){

          if(err){
            console.log(err);
          } else{
            console.log("Successfully inserted!");
          }

          res.redirect("/");
        });
      } else{
        res.render("list", { kindOfToday : currentDate, typeOfList : docs, listTitle : "Todo", route: "/"});
      }
    }
  });
});

app.post("/", function(req, res){
  const item = req.body.anotherItem;
  const listTitle = _.capitalize(req.body.listItems);

  const newItem = new Item({
    name: item
  });

  if(listTitle === "Todo"){
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: listTitle}, function(err, docs){
      docs.list.push(newItem);
      docs.save();
      res.redirect("/" + listTitle);
    });
  }


});

app.post("/delete", function(req, res){
  const itemID = req.body.chkItem;
  const listName = _.capitalize(req.body.listName);

  if(listName === "Todo"){
    Item.findByIdAndRemove(itemID, function(err){
      if(!err) {
        console.log("_id: " + itemID + " is successfully deleted");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name : listName}, { $pull : { list: { _id: itemID }}}, function(err, foundList){
      if(!err){
        //console.log("_id: " + itemID + " is successfully deleted");
        res.redirect("/" + listName);
      }
    });
  }
});

// app.post("/:deleteList", function(req, res){
//   const selectedItem = req.body.chkItem;
//   const arr = selectedItem.split("&");
//   const itemID = arr[0];
//   const listTitle = arr[1];
//   const deleteParam = req.params.deleteList;
//
//   if (listTitle === "To do") {
//
//   }
//   // List.findByIdAndRemove(itemID, function(err){
//   //
//   // });
//
// });

app.get("/:listName", function(req, res){
  const customListName = _.capitalize(req.params.listName);

  List.findOne({name : customListName}, function(err, doc){
    if(!err){
      if(!doc) {
        const newList = new List({
          name: customListName,
          list: defaultItems
        });

        newList.save();

        res.redirect("/"+ customListName);
      } else{
        res.render("list", { kindOfToday : currentDate, typeOfList : doc.list, listTitle : customListName, route: "/" + customListName});
      }
    }
  });
});

// //Work List
// app.get("/work", function(req, res){
//   res.render("list", { kindOfToday : currentDate, typeOfList : works, listTitle : "Work", route: "/work"})
// });
//
// app.post("/work", function(req, res){
//   let item = req.body.anotherItem;
//   let typeList = req.body.listItems;
//
//   if (typeList === "Work"){
//     works.push(item);
//     res.redirect("/work");
//   } else {
//     todos.push(item);
//     res.redirect("/");
//   }
// });

//About Page

app.get("/about", function(req, res){
  res.render("about");
});

// Checks if the server is running
app.listen(port || process.env.PORT, function(){
  console.log("Server is up and running on port " + port);
});
