const express=require("express");
const mongoose=require("mongoose");
const route=require("./route/route");
const app=express();
app.use(express.json());


mongoose.set('strictQuery', false)
mongoose.connect("mongodb+srv://RameshwarJay:RUlNC8QtlA8A91jX@rameshwarnavathar.dujri1m.mongodb.net/")

.then(() => {console.log("MongoDB is connected! 😎")})
.catch((errors) => {console.log(errors.message)})

app.use("/", route);

app.listen(4000, function () {
console.log("Server start successfully!",+ 4000)
})