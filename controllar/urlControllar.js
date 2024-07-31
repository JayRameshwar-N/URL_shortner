const urlModel = require('../model/urlModel');
const { setAsync, getAsync } = require("./redis");
const shortId = require('shortid');
const axios = require("axios");

// CHECK_VALID_STRING
const isValidString = function (value) {
    return typeof value === "string" && value.trim().length > 0;
};

// CREATE_SHORT_URL
exports.createUrl = async function (req, res) {
    console.log('Connection is ok');
    try {
        if (Object.keys(req.body).length === 0) 
            return res.status(400).send({ status: false, msg: "Please provide the request body!" });
        
        let { longUrl } = req.body; 
        if (!longUrl) 
            return res.status(400).send({ status: false, msg: "Please provide the long URL in the request body!" });
        
        if (!isValidString(longUrl)) 
            return res.status(400).send({ status: false, message: "Invalid long URL" });

        // Validate long URL
        let options = { method: "get", url: longUrl };
        let validURL = await axios(options).then(() => longUrl).catch(() => null);

        if (!validURL) 
            return res.status(400).send({ status: false, msg: `The URL ${longUrl} does not exist` });

        // Check if the URL already exists in the database
        let unique = await urlModel.findOne({ longUrl }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
        if (unique) {
            await setAsync(longUrl, JSON.stringify(unique));
            return res.status(200).send({ status: true, data: unique });
        }

        // Create new short URL
        let shortid = shortId.generate().toLowerCase();
        let baseURL = req.headers.host;
        let shortUrl = `http://${baseURL}/${shortid}`;

        let data = { longUrl, urlCode: shortid, shortUrl };
        let url = await urlModel.create(data);

        let result = { longUrl: url.longUrl, urlCode: url.urlCode, shortUrl: url.shortUrl };
        return res.status(201).send({ status: true, msg: result });

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
};

// GET_URL
exports.getURL = async function (req, res) {
    const { urlCode } = req.params;
    if (!shortId.isValid(urlCode)) 
        return res.status(400).send({ status: false, msg: `The URL code ${urlCode} is not valid` });

    let fetchURLdocument = await getAsync(urlCode);
    if (fetchURLdocument) {
        let data = JSON.parse(fetchURLdocument);
        return res.status(302).redirect(data.longUrl);
    } else {
        let url = await urlModel.findOne({ urlCode }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
        if (!url) 
            return res.status(404).send({ status: false, msg: "URL not found" });
        
        await setAsync(urlCode, JSON.stringify(url));
        return res.status(302).redirect(url.longUrl);
    }
};
