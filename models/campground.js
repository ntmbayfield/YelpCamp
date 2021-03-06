var mongoose = require("mongoose");
//SCHEMAS
var campgroundSchema = new mongoose.Schema({
   name: String,
   price: Number,
   image: String,
   desc: String,
   location: String,
   lat: Number,
   lng: Number,
   createdAt: {type: Date, default: Date.now},
   author: {
      id: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
      username: String
   },
   comments: [{type: mongoose.Schema.Types.ObjectId, ref: "Comment"}],
   ratings: [{ user: {type: mongoose.Schema.Types.ObjectId, ref: "User"}, rate: Number}],
   avg_rating: {type: Number, default: 0}
});
//MODELS
module.exports = mongoose.model("Campground",campgroundSchema);