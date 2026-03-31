const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rchitrita406@gmail.com",
    pass: "lksk rphk egxa prka"   // app password
  }
});

/* =================================================
   MAIL TO STAFF – COMPLAINT ASSIGNED
================================================= */
async function sendAssignmentMail(to, complaint) {
  const info = await transporter.sendMail({
    from: '"Complaint System" <rchitrita406@gmail.com>',
    to,
    subject: "New Complaint Assigned",
    html: `
      <h3>New Complaint Assigned</h3>

      <p><b>Complaint ID:</b> ${complaint.id}</p>
      <p><b>Category:</b> ${complaint.category}</p>
      <p><b>Description:</b> ${complaint.description}</p>
      <p><b>Location:</b> ${complaint.location}</p>
      <p><b>Priority:</b> ${complaint.priority}</p>

      <hr/>

      <p>
        Please login to the <b>Staff Dashboard</b>
        to update the complaint status.
      </p>

      <p style="color:gray">
        (Status updates are allowed only from dashboard)
      </p>
    `
  });

  console.log("Assignment email sent:", info.messageId);
}

/* =================================================
   MAIL TO CITIZEN – STAFF CONFIRMATION
================================================= */
async function sendCitizenConfirmationMail(to, complaint) {
  const info = await transporter.sendMail({
    from: '"Complaint System" <rchitrita406@gmail.com>',
    to,
    subject: "Your Complaint Has Been Assigned - Confirmation",
    html: `
      <h3>Hello ${complaint.name}</h3>

      <p>Your complaint has been reviewed and assigned to our staff member for resolution.</p>

      <p><b>Complaint ID:</b> ${complaint.id}</p>
      <p><b>Category:</b> ${complaint.category}</p>
      <p><b>Issue:</b> ${complaint.description}</p>
      <p><b>Location:</b> ${complaint.location}, ${complaint.city}</p>
      <p><b>Status:</b> <span style="color: #FF9800; font-weight: bold;">In Progress</span></p>

      <hr/>

      <p>Our staff will contact you soon with updates on your complaint.</p>
      <p>Thank you for using our complaint management system.</p>

      <p style="color:gray; font-size:12px;">
        If you have any questions, please reply to this email.
      </p>
    `
  });

  console.log("Citizen confirmation email sent:", info.messageId);
  return info;
}

/* =================================================
   MAIL TO CITIZEN – STATUS UPDATE
================================================= */
async function sendCitizenResolvedMail(to, complaint) {
  const info = await transporter.sendMail({
    from: '"Complaint System" <rchitrita406@gmail.com>',
    to,
    subject: "Complaint Status Update",
    html: `
      <h3>Hello ${complaint.name}</h3>

      <p>Your complaint status has been updated.</p>

      <p><b>Complaint ID:</b> ${complaint.id}</p>
      <p><b>Issue:</b> ${complaint.description}</p>
      <p><b>Status:</b> ${complaint.status}</p>

      <p>Thank you for using our service.</p>
    `
  });

  console.log("Citizen email sent:", info.messageId);
}

/* =================================================
   MAIL TO HEAD – STATUS UPDATE BY STAFF
================================================= */
async function sendHeadResolvedMail(to, complaint) {
  const info = await transporter.sendMail({
    from: '"Complaint System" <rchitrita406@gmail.com>',
    to,
    subject: "Complaint Updated by Staff",
    html: `
      <h3>Complaint Status Updated</h3>

      <p><b>Complaint ID:</b> ${complaint.id}</p>
      <p><b>Citizen:</b> ${complaint.name}</p>
      <p><b>Issue:</b> ${complaint.description}</p>
      <p><b>Status:</b> ${complaint.status}</p>
    `
  });

  console.log("Head email sent:", info.messageId);
}

/* =================================================
   MAIL TO CITIZEN – STATUS UPDATE BY EMPLOYEE
================================================= */
async function sendCitizenEmployeeUpdateMail(to, complaint) {
  const info = await transporter.sendMail({
    from: '"Complaint System" <rchitrita406@gmail.com>',
    to,
    subject: "Complaint Status Update - Work Progress",
    html: `
      <h3>Hello ${complaint.name}</h3>

      <p>Your complaint has been updated with the latest status and progress.</p>

      <p><b>Complaint ID:</b> ${complaint.id}</p>
      <p><b>Category:</b> ${complaint.category}</p>
      <p><b>Issue:</b> ${complaint.description}</p>
      <p><b>Current Status:</b> <span style="color: #FF9800; font-weight: bold;">${complaint.status}</span></p>

      <hr/>

      <h4>Update Details:</h4>
      <p>${complaint.remarks || 'No remarks provided'}</p>

      <hr/>

      <p>Thank you for your patience. We're working on resolving your complaint.</p>

      <p style="color:gray; font-size:12px;">
        If you have any questions, please reply to this email.
      </p>
    `
  });

  console.log("Citizen employee update email sent:", info.messageId);
  return info;
}

/* =================================================
   MAIL TO HEAD – STATUS UPDATE BY EMPLOYEE
================================================= */
async function sendHeadEmployeeUpdateMail(to, complaint) {
  const info = await transporter.sendMail({
    from: '"Complaint System" <rchitrita406@gmail.com>',
    to,
    subject: "Complaint Updated by Employee",
    html: `
      <h3>Complaint Status Updated</h3>

      <p><b>Complaint ID:</b> ${complaint.id}</p>
      <p><b>Citizen:</b> ${complaint.name}</p>
      <p><b>Category:</b> ${complaint.category}</p>
      <p><b>Issue:</b> ${complaint.description}</p>
      <p><b>New Status:</b> <span style="font-weight: bold;">${complaint.status}</span></p>

      <hr/>

      <h4>Employee Remarks:</h4>
      <p>${complaint.remarks || 'No remarks'}</p>

      ${
        complaint.internal_note
          ? `<h4>Internal Notes:</h4><p>${complaint.internal_note}</p>`
          : ""
      }
    `
  });

  console.log("Head employee update email sent:", info.messageId);
}

/* =================================================
   MAIL TO STAFF – STATUS UPDATE BY EMPLOYEE
================================================= */
async function sendStaffEmployeeUpdateMail(to, complaint) {
  const info = await transporter.sendMail({
    from: '"Complaint System" <rchitrita406@gmail.com>',
    to,
    subject: "Complaint Updated by Assigned Employee",
    html: `
      <h3>Complaint Updated by Employee</h3>

      <p><b>Complaint ID:</b> ${complaint.id}</p>
      <p><b>Citizen:</b> ${complaint.name}</p>
      <p><b>Category:</b> ${complaint.category}</p>
      <p><b>Issue:</b> ${complaint.description}</p>
      <p><b>New Status:</b> <span style="font-weight: bold;">${complaint.status}</span></p>

      <hr/>

      <h4>Employee Work Details:</h4>
      <p>${complaint.remarks || 'No remarks'}</p>

      ${
        complaint.internal_note
          ? `<h4>Internal Notes:</h4><p>${complaint.internal_note}</p>`
          : ""
      }
    `
  });

  console.log("Staff employee update email sent:", info.messageId);
}

/* =================================================
   MAIL TO EMPLOYEE – COMPLAINT ASSIGNED BY STAFF
================================================= */
async function sendEmployeeAssignmentMail(to, complaint) {
  const info = await transporter.sendMail({
    from: '"Complaint System" <rchitrita406@gmail.com>',
    to,
    subject: "New Complaint Assigned - Action Required",
    html: `
      <h3>New Complaint Assigned to You</h3>

      <p>Hello,</p>

      <p>A new complaint has been assigned to you for resolution. Please review the details below and begin work.</p>

      <p><b>Complaint ID:</b> ${complaint.id}</p>
      <p><b>Category:</b> ${complaint.category}</p>
      <p><b>Description:</b> ${complaint.description}</p>
      <p><b>Location:</b> ${complaint.location}, ${complaint.city}</p>
      <p><b>Citizen Name:</b> ${complaint.name}</p>
      <p><b>Citizen Contact:</b> ${complaint.email}</p>
      <p><b>Priority:</b> ${complaint.priority}</p>

      <hr/>

      <p>Please login to the <b>Employee Dashboard</b> to view and update this complaint.</p>

      <p>Once you complete the work, please upload proof/documentation and mark the complaint as resolved.</p>

      <p style="color:gray; font-size:12px;">
        This is an automated notification. Please do not reply to this email.
      </p>
    `
  });

  console.log("Employee assignment email sent:", info.messageId);
  return info;
}

/* =================================================
   MAIL TO CITIZEN – CONFIRMATION FROM STAFF (AFTER EMPLOYEE UPDATE)
================================================= */
async function sendStaffToCitizenUpdateMail(to, complaint, staffName) {
  const info = await transporter.sendMail({
    from: '"Complaint System" <rchitrita406@gmail.com>',
    to,
    subject: "Complaint Update Confirmation from Staff",
    html: `
      <h3>Hello ${complaint.name}</h3>

      <p>We have reviewed the latest update on your complaint. Our staff member <b>${staffName}</b> confirms the progress.</p>

      <p><b>Complaint ID:</b> ${complaint.id}</p>
      <p><b>Category:</b> ${complaint.category}</p>
      <p><b>Issue:</b> ${complaint.description}</p>
      <p><b>Current Status:</b> <span style="color: #FF9800; font-weight: bold;">${complaint.status}</span></p>

      <hr/>

      <h4>Work Update:</h4>
      <p>${complaint.remarks || 'Work in progress'}</p>

      <hr/>

      <p>We appreciate your patience. Our team is actively working on resolving your complaint.</p>

      <p style="color:gray; font-size:12px;">
        If you have any questions, please reply to this email.
      </p>
    `
  });

  console.log("Staff-to-Citizen confirmation email sent:", info.messageId);
  return info;
}

/* =================================================
   MAIL TO HEAD – CONFIRMATION FROM STAFF (AFTER EMPLOYEE UPDATE)
================================================= */
async function sendStaffToHeadUpdateMail(to, complaint, staffName) {
  const info = await transporter.sendMail({
    from: '"Complaint System" <rchitrita406@gmail.com>',
    to,
    subject: "Complaint Update Confirmation from Staff",
    html: `
      <h3>Complaint Update Notification</h3>

      <p>Staff member <b>${staffName}</b> has confirmed and reviewed the latest employee update.</p>

      <p><b>Complaint ID:</b> ${complaint.id}</p>
      <p><b>Citizen:</b> ${complaint.name}</p>
      <p><b>Category:</b> ${complaint.category}</p>
      <p><b>Issue:</b> ${complaint.description}</p>
      <p><b>Status:</b> <span style="font-weight: bold;">${complaint.status}</span></p>

      <hr/>

      <h4>Employee Work Details:</h4>
      <p>${complaint.remarks || 'Work in progress'}</p>

      ${
        complaint.internal_note
          ? `<h4>Internal Notes:</h4><p>${complaint.internal_note}</p>`
          : ""
      }

      <hr/>

      <p>Staff has forwarded this update for your review and approval.</p>
    `
  });

  console.log("Staff-to-Head confirmation email sent:", info.messageId);
  return info;
}

module.exports = {
  sendAssignmentMail,
  sendCitizenConfirmationMail,
  sendCitizenResolvedMail,
  sendHeadResolvedMail,
  sendCitizenEmployeeUpdateMail,
  sendHeadEmployeeUpdateMail,
  sendStaffEmployeeUpdateMail,
  sendEmployeeAssignmentMail,
  sendStaffToCitizenUpdateMail,
  sendStaffToHeadUpdateMail
};








