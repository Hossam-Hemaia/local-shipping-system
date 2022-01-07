const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const callSchema = new Schema(
  {
    date: {
      type: Date,
      default: Date.now(),
    },
    callingNumber: {
      type: String,
    },
    callType: {
      type: String,
      required: true,
    },
    callSummery: {
      type: String,
      default: "",
    },
    cAgentId: {
      type: Schema.Types.ObjectId,
      ref: "Cagent",
    },
  },
  { autoIndex: false }
);

module.exports = mongoose.model("Call", callSchema);
