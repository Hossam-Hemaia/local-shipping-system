const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const packageSchema = new Schema(
  {
    clientName: {
      type: String,
      required: true,
    },
    clientNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    landmark: {
      type: String,
      required: false,
    },
    region: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productPrice: {
      type: Number,
      required: true,
    },
    deliveryType: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: true,
      default: "Pending Approval",
    },
    currentPosition: {
      type: String,
      default: "Operation",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    tracker: [
      {
        packageStatus: { type: String },
        packagePosition: { type: String, default: "Seller" },
        transactionDate: { type: Date, default: Date.now() },
      },
    ],
    barCode: {
      type: String,
      default: "",
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
    },
    dAgentId: {
      type: Schema.Types.ObjectId,
      ref: "Dagent",
    },
    rAgentId: {
      type: Schema.Types.ObjectId,
      ref: "Ragent",
    },
    geoLocation: {
      type: Object,
    },
  },
  { autoIndex: false }
);
packageSchema.index({ barCode: 1 }, { unique: true });

packageSchema.methods.updateTracker = function (status, position, date) {
  this.status = status;
  this.tracker.push({
    packageStatus: this.status,
    packagePosition: position,
    transactionDate: date,
  });
  return this.save();
};

module.exports = mongoose.model("Package", packageSchema);
