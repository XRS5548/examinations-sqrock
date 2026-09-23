import { resend } from "./resend";

const FROM =
  process.env.RESEND_FROM ||
  "SQROCK <onboarding@resend.dev>";

/**
 * Certificate generated successfully
 */
export async function sendCertificateSuccessEmail({
  email,
  name,
  certificateId,
  employeeId,
  designation,
  internshipType,
  startDate,
  endDate,
  performanceGrade,
}: {
  email: string;
  name: string;
  certificateId: string;
  employeeId: string;
  designation: string;
  internshipType: string;
  startDate: string;
  endDate: string;
  performanceGrade: string;
}) {
  return resend.emails.send({
    from: FROM,

    to: [email],

    subject:
      "Your Internship Certificate Has Been Issued – SQROCK",

    html: `
      <!DOCTYPE html>
      <html>
        <body style="
          margin:0;
          padding:0;
          background:#f5f7fa;
          font-family:Arial,Helvetica,sans-serif;
        ">

          <div style="
            max-width:600px;
            margin:40px auto;
            background:#ffffff;
            border-radius:12px;
            overflow:hidden;
            border:1px solid #e5e7eb;
          ">

            <div style="
              padding:28px;
              background:#111827;
              color:white;
            ">
              <h1 style="
                margin:0;
                font-size:24px;
              ">
                Internship Certificate Issued
              </h1>
            </div>

            <div style="padding:30px">

              <p style="
                font-size:16px;
                color:#374151;
              ">
                Dear <strong>${name}</strong>,
              </p>

              <p style="
                font-size:15px;
                line-height:1.6;
                color:#4b5563;
              ">
                We are pleased to inform you that your
                internship certificate has been successfully
                generated and issued by SQROCK.
              </p>

              <div style="
                margin:25px 0;
                padding:20px;
                background:#f9fafb;
                border:1px solid #e5e7eb;
                border-radius:8px;
              ">

                <p>
                  <strong>Certificate ID:</strong>
                  ${certificateId}
                </p>

                <p>
                  <strong>Employee ID:</strong>
                  ${employeeId}
                </p>

                <p>
                  <strong>Designation:</strong>
                  ${designation}
                </p>

                <p>
                  <strong>Internship Type:</strong>
                  ${internshipType}
                </p>

                <p>
                  <strong>Duration:</strong>
                  ${startDate} → ${endDate}
                </p>

                <p>
                  <strong>Performance:</strong>
                  ${performanceGrade}
                </p>

              </div>

              <p style="
                font-size:14px;
                color:#6b7280;
                line-height:1.6;
              ">
                You can use your certificate ID for
                verification whenever required.
              </p>

              <p style="
                margin-top:30px;
                color:#374151;
              ">
                Regards,<br>
                <strong>SQROCK Team</strong>
              </p>

            </div>

          </div>

        </body>
      </html>
    `,
  });
}


/**
 * Certificate generation failed
 */
export async function sendCertificateFailureEmail({
  email,
  name,
  reason,
}: {
  email: string;
  name: string;
  reason: string;
}) {
  return resend.emails.send({
    from: FROM,

    to: [email],

    subject:
      "Internship Certificate Update – SQROCK",

    html: `
      <!DOCTYPE html>
      <html>
        <body style="
          margin:0;
          padding:0;
          background:#f5f7fa;
          font-family:Arial,Helvetica,sans-serif;
        ">

          <div style="
            max-width:600px;
            margin:40px auto;
            background:#ffffff;
            border-radius:12px;
            overflow:hidden;
            border:1px solid #e5e7eb;
          ">

            <div style="
              padding:28px;
              background:#111827;
              color:white;
            ">
              <h1 style="
                margin:0;
                font-size:24px;
              ">
                Certificate Update
              </h1>
            </div>

            <div style="padding:30px">

              <p style="
                font-size:16px;
                color:#374151;
              ">
                Dear <strong>${name}</strong>,
              </p>

              <p style="
                font-size:15px;
                line-height:1.6;
                color:#4b5563;
              ">
                We were unable to generate your internship
                certificate at this time.
              </p>

              <div style="
                margin:25px 0;
                padding:20px;
                background:#fff7ed;
                border:1px solid #fed7aa;
                border-radius:8px;
              ">

                <p style="
                  margin:0;
                  color:#9a3412;
                ">
                  <strong>Reason:</strong>
                  ${reason}
                </p>

              </div>

              <p style="
                font-size:14px;
                line-height:1.6;
                color:#6b7280;
              ">
                If you believe this is incorrect, please
                contact the SQROCK team for assistance.
              </p>

              <p style="
                margin-top:30px;
                color:#374151;
              ">
                Regards,<br>
                <strong>SQROCK Team</strong>
              </p>

            </div>

          </div>

        </body>
      </html>
    `,
  });
}