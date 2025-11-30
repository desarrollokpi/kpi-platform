const permissionsService = require("../common/permissions.service");
const dashboardsServices = require("./dashboards.services");
const dashboardsRepository = require("./dashboards.repository");
const emailService = require("../common/email.service");
const { ForbiddenError, NotFoundError, ValidationError } = require("../common/exception");

exports.generateDashboardPdf = async (dashboardId, userId) => {
  // Validate access using permissions service (Regla de oro)
  const hasAccess = await permissionsService.validateUserDashboardAccess(userId, dashboardId);
  if (!hasAccess) {
    throw new ForbiddenError("You do not have access to this dashboard");
  }

  // Get dashboard with embed info
  const dashboardInfo = await dashboardsServices.getDashboardEmbedInfo(dashboardId, userId);
  if (!dashboardInfo) {
    throw new NotFoundError("Dashboard not found or not accessible");
  }

  try {
    // For now: Create a placeholder PDF with metadata
    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument();

    // Create buffer to collect PDF data
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));

    return new Promise((resolve, reject) => {
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });

      doc.on("error", reject);

      // Add content to PDF
      doc.fontSize(20).text("Dashboard Snapshot", { align: "center" });
      doc.moveDown();
      doc.fontSize(14).text(`Dashboard: ${dashboardInfo.name}`);
      doc.moveDown();
      doc.fontSize(12).text(`Report: ${dashboardInfo.reportName}`);
      doc.text(`Workspace: ${dashboardInfo.workspaceName}`);
      doc.text(`Instance: ${dashboardInfo.instanceName}`);
      doc.moveDown();
      doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`);
      doc.text(`Instance ID: ${dashboardInfo.instanceId}`);
      doc.moveDown(2);

      doc.fontSize(10).fillColor("red").text("⚠️  This is a placeholder PDF", { align: "center" });
      doc.text("Actual dashboard rendering not yet implemented", { align: "center" });
      doc.moveDown();
      doc.fillColor("black").text("To implement full functionality:", { align: "left" });
      doc.text("1. Install Puppeteer: npm install puppeteer");
      doc.text("2. Update dashboards.pdf.service.js with rendering logic");
      doc.text("3. Configure Superset authentication for snapshot capture");

      doc.end();
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};

exports.sendDashboardEmail = async (dashboardId, userId) => {
  // Validate access
  const hasAccess = await permissionsService.validateUserDashboardAccess(userId, dashboardId);
  if (!hasAccess) {
    throw new ForbiddenError("You do not have access to this dashboard");
  }

  // Get user email using repository (Drizzle)
  const user = await dashboardsRepository.findActiveUserById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }
  if (!user.mail) {
    throw new ValidationError("User does not have an email address configured");
  }

  // Validate email format
  if (!emailService.isValidEmail(user.mail)) {
    throw new ValidationError("User email address is invalid");
  }

  // Get dashboard info
  const dashboardInfo = await dashboardsServices.getDashboardEmbedInfo(dashboardId, userId);

  // Generate PDF
  console.log(`Generating PDF for dashboard ${dashboardId}...`);
  const pdfBuffer = await exports.generateDashboardPdf(dashboardId, userId);

  // Prepare email
  const timestamp = new Date().toISOString().split("T")[0];
  const safeName = (dashboardInfo.name || "dashboard").replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const filename = `dashboard_${safeName}_${timestamp}.pdf`;

  const emailSubject = `Dashboard Snapshot: ${dashboardInfo.name}`;
  const emailBody = `
    <html>
      <body>
        <h2>Dashboard Snapshot</h2>
        <p>Hello ${user.name || user.userName},</p>
        <p>Attached is a snapshot of the dashboard you requested:</p>
        <ul>
          <li><strong>Dashboard:</strong> ${dashboardInfo.name}</li>
          <li><strong>Report:</strong> ${dashboardInfo.reportName}</li>
          <li><strong>Workspace:</strong> ${dashboardInfo.workspaceName}</li>
          <li><strong>Generated:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        <p>This snapshot was generated at your request from the KPI Platform.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          This is an automated message. Please do not reply to this email.
        </p>
      </body>
    </html>
  `;

  // Send email with PDF attachment
  console.log(`Sending email to ${user.mail}...`);
  const result = await emailService.sendEmail({
    to: user.mail,
    subject: emailSubject,
    body: emailBody,
    attachments: [
      {
        filename,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  return {
    success: result.success,
    message: `Dashboard snapshot sent to ${user.mail}`,
    recipient: user.mail,
    filename,
  };
};

module.exports = exports;
