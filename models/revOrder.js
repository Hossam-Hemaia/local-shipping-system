const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const revOrderSchema = new Schema({
  orderDate: {
    type: Date,
    required: true,
  },
  receivingRegion: {
    type: String,
    required: true,
  },
  orderStatus: {
    type: String,
    required: true,
    default: "pending review",
  },
  packages: [
    {
      packageId: {
        type: Schema.Types.ObjectId,
        ref: "Package",
        required: true,
      },
    },
  ],
  dAgentId: {
    type: Schema.Types.ObjectId,
    ref: "Dagent",
    required: true,
  },
  receiver: {
    type: String,
  },
});

module.exports = mongoose.model("RevOrder", revOrderSchema);
