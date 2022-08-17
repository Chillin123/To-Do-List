const express= require("express");
const bodyParser= require("body-parser");
// const date=require(__dirname+ "/date.js");
const mongoose= require("mongoose");
const app=express();

// var items=["Buy food", "Cook food", "Eat food"];
var workItems=[];

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema=mongoose.Schema({
    itemName: String
})
const listSchema={
    name: String,
    items: [itemsSchema]
}

const List= mongoose.model("List", listSchema);
const Item=mongoose.model("Item", itemsSchema);

const it1=new Item({
    itemName: "Buy Food"
});
const it2=new Item({
    itemName: "Cook Food"
});
const it3=new Item({
    itemName: "Eat Food"
});

const defaultItems=[it1,it2,it3];



app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.get("/", function(req,res){
    // let day = date.getDate();
    Item.find({},function(err,foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("Successfull");
                }
            });
        }
        res.render("list",{listTitle:"Today", nli: foundItems});
    })
   
    //res.send("hello");
})

app.post("/", function(req,res){
    //var item=(req.body.newItem);
    let listName=req.body.list;
    //console.log(req.body.list);
    const itName= req.body.newItem;
    const itNew=new Item({
        itemName:itName
    })
    
    //items.push(item);
    //res.send("Hello");
    if(listName==="Today"){
        itNew.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(itNew);
            foundList.save();
            res.redirect("/"+listName);
        })
    }
    
})

app.get("/:customListName", function(req,res){
    const customListName=(req.params.customListName);
    List.findOne({name: customListName},function(err,foundList){
        if(!err){
            if(!foundList){
                // console.log("not exist");
                const list= new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            }else{
                res.render("list",{listTitle:foundList.name, nli: foundList.items})
            }
        }
    })
    
})

app.post("/work", function(req,res){
    let item= req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
})

app.post("/delete", function(req,res){
    const listName=req.body.listName
    const checkedItemId=(req.body.checkbox);
    if(listName==="Today"){
        Item.findByIdAndRemove({_id: checkedItemId}, function(err){
            if(!err){
                console.log(err);
                res.redirect("/");
            }
        })
    } 
    
})

app.get("/about", function(req,res){
    res.render("about");
})

app.listen(3000, function(){
    console.log("Server started");
})