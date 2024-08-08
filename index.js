const express= require("express")
const mongoose= require("mongoose")
require("dotenv").config()

const route= require("./route/route")
const app =express();
const PORT =process.env.PORT ||4000



mongoose.connect(process.env.MONGODB_URL)
.then(()=>console.log('Data base is connected!!'))
.catch((err)=>console.log(err))


app.use('/',route)

app.listen(PORT ,()=>console.log(`Server is start on http://localhost:${PORT}`))