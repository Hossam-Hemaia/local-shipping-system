const mongoose = require("mongoose");
const { schema } = require("./order");
const Schema = mongoose.Schema;

const dAgentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  idNumber: {
    type: String,
    required: true,
  },
  currentAddress: {
    type: String,
    required: true,
  },
  rAgentId: {
    type: Schema.Types.ObjectId,
    ref: "Ragent",
  },
  cAgentId: {
    type: Schema.Types.ObjectId,
    ref: "Cagent",
  },
  region: {
    type: String,
    required: true,
  },
  deliveryMean: {
    type: String,
    required: false,
  },
  carType: {
    type: String,
  },
  driverLicense: {
    type: String,
    required: true,
  },
  vehicleLicense: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
  },
  userName: {
    type: String,
  },
  password: {
    type: String,
  },
  dAgentRequest: {
    type: String,
    default: "pending",
  },
});

module.exports = mongoose.model("Dagent", dAgentSchema);
