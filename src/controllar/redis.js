const redis = require("redis");
const {promisify}=require("util");


//
const redisClient = redis.createClient(
13803,                                                           
"redis-13803.c264.ap-south-1-1.ec2.cloud.redislabs.com",            
{ no_ready_check: true }
)

redisClient.on("connect", async function () {
console.log("Connected to Redis..");
}
);

//
const setAsync = promisify(redisClient.SET).bind(redisClient);
const getAsync = promisify(redisClient.GET).bind(redisClient);


//
module.exports={setAsync,getAsync}
