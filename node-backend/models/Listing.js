const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    year: { type: Number, required: true },
    city: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);