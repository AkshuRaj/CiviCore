const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: ["Electricity", "Water", "Roads", "Sanitation"]
    },
    description: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "In Progress", "Resolved"]
    },
    priority: {
      type: String,
      default: "Medium",
      enum: ["Low", "Medium", "High"]
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    assignedDate: {
      type: Date,
      default: null
    },
    dueDate: {
      type: Date,
      default: null
    },
    slaStatus: {
      type: String,
      default: "On Track",
      enum: ["On Track", "At Risk", "Overdue"]
    },
    escalationLevel: {
      type: Number,
      default: 0
    },
    reassignedFrom: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    internalNotes: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
