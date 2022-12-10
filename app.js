//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const port = process.env.PORT || 3000;

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//connecting app to mongoDB
mongoose.connect(
  "mongodb+srv://veer:8440089101B%40lveer@atlascluster.ue0sv83.mongodb.net/todolistDB",
  {
    useNewUrlParser: true,
  }
);
const itemSchema = {
  name: String,
};
const Item = mongoose.model("Item", itemSchema); //mongoose model has first capital letter. Model is your actual DB with schema you mentioned
//first parameter to mongoose model is singular same of your collection , and second param is schema for collection.

const defaultItems = [
  { name: "buy milk" },
  { name: "go to school" },
  { name: "complete testimonial page" },
];

app.get("/", function (req, res) {
  const day = date.getDate();
  Item.find((err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          return handleError(err);
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: day, newListItems: foundItems });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item1 = new Item({
    name: itemName,
  });

  if (listName === date.getDate()) {
    item1.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, foundList) => {
      foundList.items.push(item1);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", (req, res) => {
  console.log(req.body);

  const checkedItemId = req.body.deleteItem;
  const listName = req.body.deleteList;

  if (listName === date.getDate()) {
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if (!err) {
        console.log("successfully deleted");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      (err, foundList) => {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

const listSchema = {
  name: String,
  items: [itemSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        // create a new list
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    } else {
      console.log(err);
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(port, () => console.log(`server started on port ${port}`));
