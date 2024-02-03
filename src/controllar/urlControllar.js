const urlModel = require('../model/urlModel');
const {setAsync,getAsync}=require("./redis")
const shortId= require('shortid');
const axios=require("axios");



//   CHECK_VALID_STRING
const isValidString = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
    };



//   CREATE_SHORT_URL
exports.createUrl=async function(req,res){
    try{
        if(Object.keys(req.body).length==0) return res.status(400).send({status:false,msg:"please provide the req body !!"})
        let data=req.body
        const {longUrl}=data
        if(!longUrl) return res.status(400).send({status:false,msg:"please provide the longURL in  req body !!"})
        if(!isValidString(longUrl)) return res.status(400).send({status:false,message:"invalid longUrl"})


    let options={
        method:"get",
        url:longUrl
        }
    let validURL=await axios(options)
    .then(()=>longUrl)
    .catch(()=>null)

    if(!validURL) return res.status(400).send({status:false,msg:`this ${longUrl} is not exists`})

    let unique=await urlModel.findOne({longUrl}).select({_id:0,createdAt:0,updatedAt:0,__v:0})
    if(unique) {
        await setAsync(longUrl,JSON.stringify(unique))
        return res.status(200).send({status:true,data:unique})
        }              

    let shortid=shortId.generate().toLowerCase()
    data.urlCode=shortid

    let baseURL=req.headers.host
    
    let shortUrl=`http://${baseURL}/${shortid}` //lohjuhgh:30000/fggghfgf
    data.shortUrl=shortUrl
    
    let url=await urlModel.create(data)
    
    let result={
        longUrl:url.longUrl,
        urlCode:url.urlCode,
        shortUrl:url.shortUrl
        }
    return res.status(201).send({status:true,msg:result})
    }
catch(err){
    return res.status(500).send({status:false,msg:err.message})
    }}



//   GET_URL
exports.getURL=async function(req,res){
    const {urlCode}=req.params
    if(!shortId.isValid(urlCode)) return res.status(400).send({status:false,msg:`this ${urlCode} is not valid`})

    let fetchURLdocument=await getAsync(urlCode)
    if(fetchURLdocument){                                             //-- CATCH_HIT

    var data = JSON.parse(fetchURLdocument);
    return res.status(302).redirect(data.longUrl)
    }
    else{ 
        let url=await urlModel.findOne({urlCode:urlCode}).select({_id:0,createdAt:0,updatedAt:0,__v:0})
        await setAsync(urlCode, JSON.stringify(url))   
        return res.status(302).redirect(url.longUrl)
    }}

    ////////////////////