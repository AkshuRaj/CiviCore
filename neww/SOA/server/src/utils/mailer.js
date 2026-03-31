const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rchitrita406@gmail.com",
    pass: "zyqs tlli poqc uqdu"   
  }
});

/*  MAIL TO STAFF (ASSIGN) */
async function sendAssignmentMail(to, complaint) {
  const baseUrl = "http://localhost:5000";

  const info = await transporter.sendMail({
    from: '"Complaint System" <demo90214@gmail.com>',
    to,
    subject: " New Complaint Assigned",
    html: `
      <h3>New Complaint Asbzsigned</h3>

      <p><b>Category:</b> ${complaint.category}</p>
      <p><b>Description:</b> ${complaint.description}</p>
      <p><b>Location:</b> ${complaint.location}</p>
      <p><b>Priority:</b> ${complaint.priority}</p>

      <hr/>

      <h4>Update Status</h4>

      <a href="http://localhost:5000/email/status/${complaint.id}/PENDING"
         style="padding:10px;background:orange;color:white;text-decoration:none;">
         Pending
      </a>

      <a href="http://localhost:5000/email/status/${complaint.id}/IN_PROGRESS"
         style="padding:10px;background:blue;color:white;text-decoration:none;margin-left:10px;">
         In Progress
      </a>

      <a href="http://localhost:5000/email/status/${complaint.id}/RESOLVED"
         style="padding:10px;background:green;color:white;text-decoration:none;margin-left:10px;">
         Resolved
      </a>
    `
  });

  console.log("Assignment email sent:", info.messageId);
}

/*MAIL TO CITIZEN (RESOLVED)*/
async function sendCitizenResolvedMail(to, complaint) {
  const info = await transporter.sendMail({
    from: '"Complaint System" <demo90214@gmail.com>',
    to,
    subject: "Complaint Resolved",
    html: `
      <h3>Hello ${complaint.name}</h3>
      <p>Your complaint has been successfully resolved.</p>
      <p><b>Issue:</b> ${complaint.description}</p>
      <p><b>Status:</b> RESOLVED</p>
    `
  });

  console.log("Citizen email sent:", info.messageId);
}

  /* MAIL TO HEAD (RESOLVED)*/

async function sendHeadResolvedMail(to, complaint) {
  const info = await transporter.sendMail({
    from: '"Complaint System" <demo90214@gmail.com>',
    to,
    subject: " Complaint Resolved by Staff",
    html: `
      <h3>Complaint Resolved</h3>
      <p><b>Citizen:</b> ${complaint.name}</p>
      <p><b>Issue:</b> ${complaint.description}</p>
      <p><b>Status:</b> RESOLVED</p>
    `
  });

  console.log("Head email sent:", info.messageId);
}
module.exports = {
  sendAssignmentMail,
  sendCitizenResolvedMail,
  sendHeadResolvedMail
};
