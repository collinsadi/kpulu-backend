const express = require('express')
const shortid = require('shortid')
const mongoose = require('mongoose')
const morgan = require('morgan')
const app = express()
const ShortUrl = require('./models/shortUrl')
const qrcode = require('qrcode')
const cors = require('cors')

const port = 5000

app.listen(port, ()=>{

    console.log("server Started")

})

const localurl = "mongodb://127.0.0.1:27017/gimba"

// connect database

mongoose.connect(localurl, {useNewUrlParser: true, useUnifiedTopology: true})

.then(_=>{
    console.log("Database Don Connect")
})

.catch(error=>{
    console.log("Databse no dey gree Connect", error)
})

// middle wares
app.use(morgan('dev'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:3000'
}))




app.get("/api", (request, response)=>{

    response.status(200).json({status: "Sucess", message: "Welcome to The Url Shortener Website API"})

})

app.get('/generate', async (request, response)=>{

   const id = await shortid.generate()

   response.status(200).json({status: "sucess", yourUniqueId: id})

    
})

app.post('/shorten', async (request, response)=>{

    let {long_Url, unique_id} = request.body

    try{

        if(!long_Url){

            return response.status(401).json({status: "error", details: "No Url to Shorten"})
        }

        // if(!long_Url.includes('https://') || !long_Url.includes('http://')){

        // return response.status(401).json({details: "Please Enter a Valid Url"})
        // }

        if(unique_id){
            
          const existinglink = await ShortUrl.findOne({unique_id})

          if(existinglink){

            return response.status(401).json({status: "error", details: "Url Already Use"})
          }
        }

        if(!unique_id){

            unique_id = await shortid.generate()


        }

       const shorturl = await ShortUrl.create({long_Url, unique_id})
        await shorturl.save()

        response.status(200).json({status: "success", details: `Your Short Url is localhost:3000/${unique_id}`})


    } catch(error){

        console.log(error)

        response.status(500).json({status: "server Error", details: "a Server side error Occured"})
    }

})

app.get('/short/:id', async (request, response)=>{
    
    const unique_id = request.params.id

    try{

    const url = await ShortUrl.findOne({unique_id})
    if(url){

     return  response.status(200).json({redirectUrl: url.long_Url})
    }

    if(!url){

        response.status(404).json({details: "Url Not Found"})

    }
   

    } catch(error){

        response.status(500).json({status: "error", message: "an error Occured"})

        console.log(error)
    }

})