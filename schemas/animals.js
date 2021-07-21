const mongoose = require("mongoose");

const { Schema } = mongoose;
const animalsSchema = new Schema({
    visitCount: {
        type: Number,
        required: true,
    },
    like: {
        type: Number,
        required: true,
    },
    animalId:{
        type:Number,
        required:true,
    },
    userId: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    animalName: {
        type: String,
        required: true,
    },
    animalSpecies: {
        type: String,
        required: true,
    },
    animalBreed: {
        type: String,
        required: true,
    },
    animalGender: {
        type: String,
        required: true,
    },
    animalAge: {
        type: Number,
        required: true,
    },
    animalStory: {
        type: String,
        required: true,
    },
    animalPhoto: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("animals", animalsSchema);