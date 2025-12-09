const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  owner: { type: String, required: false },   // or ownerName
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: false },
  status: { type: String, default: "Draft" }, // Draft, Published, Sold, etc.
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Property", propertySchema);
