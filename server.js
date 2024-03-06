const express=require("express")
const multer=require("multer")
const req=require("express/lib/request")
const bcrypt=require("bcrypt")
const File=require("./models/file")
const mongoose=require("mongoose")
const path=require("path")
const app=express()
const upload=multer({dest:"uploads"})
app.set("view engine","ejs")
app.use(express.urlencoded({extended:true}))
// app.set("views",path.join(__dirname,"/views"))
app.use(express.static(path.join(__dirname,'public')));
require('dotenv').config()
mongoose.connect("mongodb+srv://mandardeshmukh1811:mongodb@cluster0.rfqbwei.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
app.get("/",(req,res)=>{
    res.render("index")
})
app.post("/upload",upload.single("file"),async(req,res)=>{
const fileData={
    path:req.file.path,
    originalName:req.file.originalname,
    
}
if(req.body.password!=null && req.body.password!==""){
    fileData.password= await bcrypt.hash(req.body.password,10)
}
const file=await File.create(fileData)
// console.log(file)
console.log(req.headers.origin)
res.render("index",{fileLink:`${req.headers.origin}/file/${file.id}`})
})
const handleDownload= async(req,res)=>{
    const file= await File.findById(req.params.id)

    if(file.password!=null){
        if(req.body.password == null){
            res.render("password")
            return
        }
    
        if(!(await bcrypt.compare(req.body.password,file.password))){
            res.render("password",{error:true})
            return
        }
    }
    
    file.downloadCount++
    await file.save()
    console.log(file.downloadCount)
    res.download(file.path,file.originalName)
}
app.route("/file/:id").get(handleDownload).post(handleDownload)
// app.get("/file/:id",handleDownload)
// app.post("/file/:id",handleDownload)




app.listen(process.env.PORT);