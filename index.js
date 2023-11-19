const express = require('express')
const shortid = require('shortid')
const mongoose = require('mongoose')
const morgan = require('morgan')
const app = express()
const ShortUrl = require('./models/shortUrl')
const TelegramBot = require('node-telegram-bot-api/lib/telegram')
require("dotenv").config()
const token = process.env.TOKEN
const serverUrl = process.env.SERVER_URL
const bot = new TelegramBot(token, { polling: true })
const cron = require("node-cron");
const axios = require("axios");
const port = 5000

app.listen(port, ()=>{
    console.log("server Started")
})

const localurl = "mongodb://127.0.0.1:27017"
const liveurl = process.env.LIVE_URL
// connect database

mongoose.connect(liveurl, {useNewUrlParser: true, useUnifiedTopology: true})

.then(_=>{
    console.log("Database Don Connect")
})

.catch(error=>{
    console.log("Databse no dey  Connect", error)
})

// middle wares
app.use(morgan('dev'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())




app.get("/api", (request, response)=>{

response.status(200).json({status: "Sucess", message: "Welcome to The Url Shortener Website API"})

})

app.get('/generate', async (request, response)=>{

   const id = await shortid.generate()

   response.status(200).json({status: "sucess", yourUniqueId: id})

    
})

bot.on("message", async (msg) => {
    
    const chatId = msg.chat.id
    const message = msg.text
    let unique_id =""

    try{

        if(!message.includes("http://") && !message.includes("https://")){

            return bot.sendMessage(chatId, "Please Send a Valid Url with HTTP or HTTPS")
        }


        if(!unique_id){

            unique_id = await shortid.generate()


        }
        if(unique_id.split(' ').length > 0){

            unique_id = unique_id.split(' ').join('-')
        }

       const shorturl = await ShortUrl.create({long_Url:message, unique_id})
        await shorturl.save()

        bot.sendMessage(chatId, `https://kpulu.vercel.app/${unique_id}`)

    } catch(error){

        console.log(error)

        bot.sendMessage(chatId, `Internal Server Error`)
    }

   


})

// app.post('/shorten', async (request, response)=>{

//     let {long_Url, unique_id} = request.body

//     try{

//         if(!long_Url){

//             return response.status(401).json({status: "error", details: "No Url to Shorten"})
//         }

//         // if(!long_Url.includes('https://') || !long_Url.includes('http://')){

//         // return response.status(401).json({details: "Please Enter a Valid Url"})
//         // }

//         if(unique_id){
            
//           const existinglink = await ShortUrl.findOne({unique_id})

//           if(existinglink){

//             return response.status(401).json({status: "error", details: "Url Already In Use"})
//           }
//         }

//         if(!unique_id){

//             unique_id = await shortid.generate()


//         }
//         if(unique_id.split(' ').length > 0){

//             unique_id = unique_id.split(' ').join('-')
//         }

//        const shorturl = await ShortUrl.create({long_Url, unique_id})
//         await shorturl.save()

//         response.status(200).json({status: "success", details: `Your Short Url is localhost:3000/${unique_id}`})


//     } catch(error){

//         console.log(error)

//         response.status(500).json({status: "server Error", details: "a Server side error Occured"})
//     }

// })

// cron to keep server online (runs every 5 minutes)
cron.schedule("*/10 * * * *", () => {
  try {
    console.log("cron running for server");
    axios.get(serverUrl);
  } catch (e) {
    console.log(e.message);
  }
});



app.get('/:id', async (request, response)=>{
    
    const unique_id = request.params.id

    try{

    const url = await ShortUrl.findOne({unique_id})
    if(url){

     return  response.redirect(url.long_Url)
    }

    if(!url){

        response.status(404).json({details: "Url Not Found"})

    }
   

    } catch(error){

        response.status(500).json({status: "error", message: "an error Occured"})

        console.log(error)
    }

})