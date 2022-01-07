const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  orderStatus: {
    type: String,
    required: true,
    default: "pending review",
  },
  receivingRegion: {
    type: String,
    required: true,
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: "Seller",
    required: true,
  },
  receiver: {
    type: String,
  },
  packages: [{ package: { type: Object } }],
});

module.exports = mongoose.model("Order", orderSchema);
