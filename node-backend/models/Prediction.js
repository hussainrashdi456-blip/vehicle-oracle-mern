const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    brand: String,
    model: String,
    year: Number,
    price: Number,
    details: Object
}, { timestamps: true });

module.exports = mongoose.model('Prediction', predictionSchema);