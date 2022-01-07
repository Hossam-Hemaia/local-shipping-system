const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const rOrderSchema = new Schema({
  rAgentId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Ragent",
  },
  orderDate: {
    type: Date,
    required: true,
  },
  orderRegion: {
    type: String,
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
  },
  secured: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Rorder", rOrderSchema);
