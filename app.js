const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const _ = require('loadash')
const app = express()
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))
app.set("view engine",'ejs')

mongoose.connect("mongodb://localhost:27017/todolistdb",{useNewUrlParser:true,useUnifiedTopology:true})

const itemSchema = {
    name:String
}
const listSchema = {
    name:String,
    items:[itemSchema]
}

const List = mongoose.model("List",listSchema)
const Item = mongoose.model("Item",itemSchema)
const defaultItems = []

app.get("/",(req,res)=>{
    
    Item.find({},(err,foundItems)=>{

        if(foundItems.length === 0){
            Item.insertMany(defaultItems,(err)=>{
                if(err){
                    console.log(err)
                }
                else{
                    console.log("Succesfully Saved into Database")
                }
            })
            res.redirect("/")
        }else{
        res.render("list",{listTitle:"Today",listItem:foundItems})
    }
    })
})

app.post("/",(req,res)=>{
    
    const itemName = req.body.newItem
    const listName = req.body.list

    const item = new Item({
        name:itemName
    })

    if(listName === "Today"){
        item.save()
        res.redirect("/")
    }else{
        List.findOne({name:listName},(err,foundList)=>{
            foundList.items.push(item)
            foundList.save()
            res.redirect("/"+listName)
        })
    }
})

app.post("/delete",(req,res)=>{
    const checkedId = req.body.checkbox
    const listName = req.body.listName

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedId,(err)=>{
            if(!err){
                console.log("Successfully Deleted")
                res.redirect("/")
            }
        })
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedId}}},(err,foundList)=>{
            if(!err){
                res.redirect("/"+listName)
            }
        })
    }

    
})

app.get("/:customListName",(req,res)=>{
    const customListName = _.capitalize(req.params.customListName)

    List.findOne({name:customListName},(err,foundList)=>{
        if(!err){
            if(!foundList){                
            const list = new List({
            name:customListName,
            items:defaultItems
            })
            list.save()
            res.redirect("/"+customListName)
            }else{
                res.render("list",{listTitle:foundList.name,listItem:foundList.items})

        }

        }
    })    
})

app.get("/about",(req,res)=>{
    res.render("about")
})


app.listen(3000,()=>{
    console.log("Server Up")
})