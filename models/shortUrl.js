const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ShortUrlSchema = new Schema({

    long_Url: {
        type: String,
        required: true
    },
    unique_id:{

        type: String,
        required: true
    }

})


const ShortUrl = mongoose.model('shorturl', ShortUrlSchema)

module.exports = ShortUrl