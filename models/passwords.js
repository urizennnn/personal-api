const mongoose = require('mongoose');

const managerSchema = mongoose.Schema(
    {
        user: {
            type: String, 
            required: [true, "Please input username"]
        },
        passManager: {
            type: Map,
            of: mongoose.Schema.Types.Mixed, 
            required: [false, "Please provide password manager data"]
        }
    }
);

const Manager = mongoose.model("Manager", managerSchema);

module.exports = Manager;
