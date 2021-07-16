const mongoose = require("mongoose")

const { Schema } = mongoose
const commentSchema = new Schema({
    
  commentId: {
    type: Number,
    required: true,
    unique: true,
  },
  animalId: {
    type: Number,
    required: true,
  },
  userId: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },

})

module.exports = mongoose.model("comment", commentSchema)