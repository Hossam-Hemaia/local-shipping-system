const { randomBytes } = require("crypto");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const rAgentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Ragent", rAgentSchema);
