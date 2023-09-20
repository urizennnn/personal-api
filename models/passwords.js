const { Schema, model } = require("mongoose");

const managerSchema = Schema({
  email: {
    type: String,
    required: [true, "Please input email"],
  },
  passManager: {
    type: Map,
    of: Schema.Types.Mixed,
    required: [false, "Please provide password manager data"],
  },
});

const Manager = model("Manager", managerSchema);

module.exports = Manager;
