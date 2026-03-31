const Complaint = require("../models/complaint");

// Function to calculate days remaining
function getDaysRemaining(dueDate) {
  const today = new Date();
  const diffTime = dueDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Check and update SLA status
async function checkAndUpdateSLA() {
  try {
    const today = new Date();
    const fiveDaysLater = new Date(today);
    fiveDaysLater.setDate(fiveDaysLater.getDate() + 5);

    console.log("[SLA Checker] Running at:", new Date().toISOString());

    // Update "At Risk" complaints (5 days or less remaining)
    const atRiskUpdate = await Complaint.updateMany(
      {
        status: "In Progress",
        dueDate: { $lte: fiveDaysLater, $gt: today },
        slaStatus: "On Track"
      },
      { 
        slaStatus: "At Risk",
        updatedAt: new Date()
      }
    );

    if (atRiskUpdate.modifiedCount > 0) {
      console.log(`[SLA Checker] Updated ${atRiskUpdate.modifiedCount} complaints to "At Risk" status`);
    }

    // Update "Overdue" complaints (past due date)
    const overdueUpdate = await Complaint.updateMany(
      {
        status: "In Progress",
        dueDate: { $lt: today },
        slaStatus: { $ne: "Overdue" }
      },
      { 
        slaStatus: "Overdue",
        updatedAt: new Date()
      }
    );

    if (overdueUpdate.modifiedCount > 0) {
      console.log(`[SLA Checker] Updated ${overdueUpdate.modifiedCount} complaints to "Overdue" status`);
    }

    // Get current statistics
    const stats = await Complaint.aggregate([
      {
        $match: { status: "In Progress" }
      },
      {
        $group: {
          _id: "$slaStatus",
          count: { $sum: 1 }
        }
      }
    ]);

    console.log("[SLA Checker] Current SLA Status:", stats);

    // Get list of overdue complaints that need escalation
    const overdueComplaints = await Complaint.find({
      slaStatus: "Overdue",
      status: "In Progress",
      escalationLevel: { $lt: 3 } // Limit escalations to 3 levels
    }).populate("assignedTo", "name email");

    if (overdueComplaints.length > 0) {
      console.log(`[SLA Checker] ${overdueComplaints.length} complaints require escalation`);
      
      // Optional: Auto-escalate flag can be set
      overdueComplaints.forEach(complaint => {
        const daysOverdue = Math.abs(getDaysRemaining(complaint.dueDate));
        console.log(`  - Complaint ${complaint._id}: ${daysOverdue} days overdue, Assigned to ${complaint.assignedTo?.name || "Unassigned"}`);
      });
    }

    return {
      success: true,
      timestamp: new Date().toISOString(),
      atRiskUpdated: atRiskUpdate.modifiedCount,
      overdueUpdated: overdueUpdate.modifiedCount,
      stats,
      overdueComplaints: overdueComplaints.length
    };
  } catch (err) {
    console.error("[SLA Checker] Error:", err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

module.exports = {
  checkAndUpdateSLA,
  getDaysRemaining
};
