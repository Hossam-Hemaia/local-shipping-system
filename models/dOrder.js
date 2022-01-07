const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dOrderSchema = new Schema(
  {
    orderDate: {
      type: Date,
      required: true,
    },
    orderStatus: {
      type: String,
      required: true,
    },
    orderRegion: {
      type: String,
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
    rAgentId: {
      type: Schema.Types.ObjectId,
      ref: "Ragent",
      required: true,
    },
    secured: {
      type: Boolean,
      default: false,
    },
  },
  { autoIndex: false }
);

dOrderSchema.index({ dAgentId: 1 }, { unique: true });
module.exports = mongoose.model("Dorder", dOrderSchema);
