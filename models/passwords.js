const { Schema, model } = require("mongoose");

const managerSchema = Schema({
  user: {
    type: String,
    required: [true, "Please input username"],
  },
  passManager: {
    type: Map,
    of: Schema.Types.Mixed,
    required: [false, "Please provide password manager data"],
  },
});

const Manager = model("Manager", managerSchema);

module.exports = Manager;
