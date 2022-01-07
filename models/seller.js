const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sellerSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  niche: {
    type: String,
    required: false,
  },
  region: {
    type: String,
    required: true,
  },
  sellerRequest: {
    type: String,
    default: "pending",
  },
  sellerCode: {
    type: String,
    default: "",
  },
  hasOffer: {
    type: Boolean,
    required: false,
    default: false,
  },
  offerEndDate: {
    type: Date,
    reqiured: false,
  },
  paymentMethod: {
    type: String,
  },
  ratio: {
    type: Number,
  },
  rejectionPolicy: {
    type: String,
  },
  customerService: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Seller", sellerSchema);
