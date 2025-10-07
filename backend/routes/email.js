const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');

// Configure transporter for Mailwire SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'cloud1.mailwire.com',
  port: process.env.EMAIL_PORT || 465,
  secure: process.env.EMAIL_SECURE === 'true' || true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false // Accept self-signed certificates if needed
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('Mailwire SMTP server is ready to send messages');
  }
});

// Send invoice email
router.post('/send-invoice', async (req, res) => {
  try {
    const { recipientEmail, invoiceData } = req.body;

    // Validation
    if (!recipientEmail) {
      return res.status(400).json({ message: 'Recipient email is required' });
    }

    if (!invoiceData) {
      return res.status(400).json({ message: 'Invoice data is required' });
    }

    // Generate commission description
    let commissionDesc = '';
    if (invoiceData.commissionDesc) {
      commissionDesc = invoiceData.commissionDesc;
    }

    // Generate HTML email content
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 40px;
            color: #333;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px;
            border-bottom: 2px solid #003366;
            padding-bottom: 20px;
          }
          .company-title {
            font-size: 20px;
            font-weight: bold;
            color: #003366;
            margin: 10px 0;
          }
          .company-address {
            font-size: 14px;
            color: #666;
          }
          .section {
            margin: 20px 0;
          }
          .amount-table { 
            width: 100%;
            margin: 24px 0;
            border-collapse: collapse;
          }
          .amount-table td { 
            padding: 8px;
            border-bottom: 1px solid #ddd;
          }
          .amount-table .desc { 
            text-align: left;
          }
          .amount-table .right { 
            text-align: right;
            font-weight: 500;
          }
          .amount-table .balance { 
            font-weight: bold;
            background-color: #f0f0f0;
            font-size: 16px;
          }
          .bank-details { 
            margin-top: 24px;
            padding: 15px;
            background-color: #f9f9f9;
            border-left: 4px solid #003366;
          }
          .bank-details b {
            display: inline-block;
            min-width: 120px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 14px;
            color: #666;
          }
          .bold {
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-title">Bestway Real Estate Ltd., Brokerage</div>
          <div class="company-address">
            500 St.George Street<br/>
            Moncton, NB  E1C 1Y3<br/>
            Phone: 506-268-2900 | Fax: 506-268-2910
          </div>
        </div>

        <div class="section">
          <div><strong>Date:</strong> ${invoiceData.date}</div>
        </div>

        <div class="section">
          <div class="bold">${invoiceData.brokerageName || ''}</div>
          <div>${invoiceData.brokerageAddress || ''}</div>
        </div>

        <div class="section">
          <div><strong>Re:</strong> ${invoiceData.re}</div>
          <div>${invoiceData.tradeNumber ? `Trade #${invoiceData.tradeNumber}, ` : ''}${invoiceData.propertyAddress}</div>
        </div>

        <div class="section">
          <div>To our commission of <strong>${commissionDesc}</strong></div>
          <div>${invoiceData.atAmountDesc}</div>
        </div>

        <table class="amount-table">
          <tr>
            <td class="desc">Less share of MLS fees</td>
            <td class="right">$${Number(invoiceData.mlsFees || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td class="desc">HST # 804667350RT</td>
            <td class="right">$${Number(invoiceData.hst || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr class="balance">
            <td class="desc">Balance Due on Closing</td>
            <td class="right">$${Number(invoiceData.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        </table>

        <div class="section">
          <div>Closing Scheduled for <strong>${invoiceData.closingDate}</strong>.</div>
          <div>Our reference number is <strong>${invoiceData.referenceNumber}</strong>.</div>
        </div>

        <div class="bank-details">
          <div class="bold" style="margin-bottom: 10px;">Please make cheque payable to Bestway Real Estate Ltd., Brokerage or adding by EFT using the Bank Details below:</div>
          <div><b>Bank:</b> Royal Bank of Canada</div>
          <div><b>Institution:</b> 003</div>
          <div><b>Transit:</b> 02413</div>
          <div><b>Account:</b> 101-1600</div>
        </div>

        <div class="footer">
          Please feel free to contact our Deals department should you require more information/clarification. 
          416-365-0100 or email adminnb@bestwayrealtyinc.comm.<br/><br/>
          Sincerely,<br/>
          <strong>Daphney Roy</strong><br/>
          Administrator<br/>
          Bestway Real Estate Ltd., Brokerage
        </div>
      </body>
      </html>
    `;

    // Email options
    const mailOptions = {
      from: `"Bestway Real Estate" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `Invoice - Trade #${invoiceData.tradeNumber || 'N/A'} - ${invoiceData.propertyAddress || ''}`,
      html: emailHTML,
      replyTo: process.env.EMAIL_USER
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', info.messageId);

    res.status(200).json({ 
      message: 'Invoice sent successfully',
      messageId: info.messageId,
      recipientEmail: recipientEmail
    });

  } catch (error) {
    console.error('Error sending email:', error);
    
    // Provide more helpful error messages
    let errorMessage = 'Failed to send invoice';
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check your email credentials.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Could not connect to email server. Please check your internet connection.';
    }
    
    res.status(500).json({ 
      message: errorMessage, 
      error: error.message 
    });
  }
});

// Send invoice email with PDF attachment
router.post('/send-invoice-pdf', async (req, res) => {
  try {
    const { recipientEmail, invoiceData, invoiceType } = req.body;

    // Validation
    if (!recipientEmail) {
      return res.status(400).json({ message: 'Recipient email is required' });
    }

    if (!invoiceData) {
      return res.status(400).json({ message: 'Invoice data is required' });
    }

    let invoiceHTML = '';

    // Generate HTML content based on invoice type
    if (invoiceType === 'lawyer') {
      // Lawyer Invoice Template (matches printLawyerInvoice exactly)
      const isLease = invoiceData.propertyType === "LEASE";
      const balanceLabel = invoiceData.balanceLabel || "Balance Due on Closing";
      
      invoiceHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Lawyer Invoice</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-title { font-size: 20px; font-weight: bold; margin-top: 8px; }
            .company-address { margin-bottom: 8px; }
            .section { margin-bottom: 24px; }
            .label { font-weight: bold; display: inline-block; min-width: 120px; }
            .value { display: inline-block; }
            .amount-table { margin-top: 24px; margin-bottom: 24px; }
            .amount-table td { padding: 2px 8px; }
            .amount-table .desc { min-width: 220px; }
            .amount-table .right { text-align: right; min-width: 100px; }
            .amount-table .bold { font-weight: bold; }
            .amount-table .balance { font-weight: bold; }
            .footer { margin-top: 32px; }
            .bank-details { margin-top: 16px; font-size: 15px; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="https://res.cloudinary.com/dyv1yieeq/image/upload/v1759428862/logo1_tonzim.jpg" alt="Bestway Real Estate Ltd. Logo" style="width: 120px; margin-bottom: 10px;" />
            <div class="company-title">Bestway Real Estate Ltd., Brokerage</div>
            <div class="company-address">500 St.George Street, Moncton, NB  E1C 1Y3</div>
            <div>Office: 506-268-2900 | Fax: 506-268-2910</div>
          </div>
          <div class="section">
            <div>${invoiceData.date}</div>
            <br/>
            <div>${invoiceData.lawyerName || invoiceData.brokerageName || ''}</div>
            <div>${invoiceData.address || invoiceData.brokerageAddress || ''}</div>
            <br/>
            <div>Re: ${invoiceData.re}</div>
            <div>${invoiceData.propertyAddress}</div>
          </div>
          <div class="section">
            <div><b>${invoiceData.commissionDescription || 'To our commission of ' + invoiceData.commissionDesc}</b></div>
            <div>At a ${isLease ? "lease" : "sale"} price of <b>$${Number(invoiceData.sellPrice || invoiceData.leasePrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></div>
            <table class="amount-table">
              <tr>
                <td class="desc">Commission payable</td>
                <td class="right">$${Number(invoiceData.commissionAmount || invoiceData.totalCommissionAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td class="desc">HST # 804667350RT</td>
                <td class="right">$${Number(invoiceData.hst || invoiceData.hstAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td class="desc">Less: Deposit</td>
                <td class="right">$${Number(invoiceData.deposit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr class="balance">
                <td class="desc">${balanceLabel}</td>
                <td class="right">$${Number(invoiceData.balanceToVendor || invoiceData.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </table>
            <div>Closing Date: <b>${invoiceData.closingDate}</b></div>
            <div>Reference Number: <b>${invoiceData.referenceNumber}</b></div>
            ${balanceLabel === "Balance to Brokerage" ? `
            <div class="bank-details">
              <br/>
              <b>Please make cheque payable to Bestway Real Estate Ltd., Brokerage or adding by EFT using the Bank Details below:</b><br/>
              Bank: Royal Bank of Canada<br/>
              Institution: 003<br/>
              Transit: 02413<br/>
              Account: 101-1600
            </div>
            ` : ""}
          </div>
          <div class="footer">
            Please feel free to contact our deals department should you require more information/clarification. 506-268-2900. Or E-mail adminnb@bestwayrealtyinc.com.<br/><br/>
            Sincerely,<br/>
            Administrator<br/>
            Bestway Real Estate Ltd., Brokerage<br/>
            66 Antibes Dr<br/>
            Brampton Ontario L6X 5H5<br/>
            Office:416-365-0100<br/>
            Fax: 506-268-2910<br/>
            adminnb@bestwayrealtyinc.com
          </div>
        </body>
        </html>
      `;
    } else {
      // Brokerage Invoice Template (matches handlePrintInvoice exactly)
      invoiceHTML = `
        <html>
        <head>
          <title>Invoice</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; }
            .bank-details { margin-top: 24px; }
            .bank-details b { display: inline-block; min-width: 120px; }
            .amount-table { margin-top: 24px; margin-bottom: 24px; }
            .amount-table td { padding: 2px 8px; }
            .amount-table .desc { min-width: 220px; }
            .amount-table .right { text-align: right; min-width: 100px; }
            .amount-table .bold { font-weight: bold; }
            .amount-table .balance { font-weight: bold; }
            .footer { margin-top: 32px; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="https://res.cloudinary.com/dyv1yieeq/image/upload/v1759428862/logo1_tonzim.jpg" alt="Bestway Real Estate Ltd. Logo" style="width: 120px; margin-bottom: 10px;" />
            <div style="font-size: 20px; font-weight: bold; margin-top: 8px;">Bestway Real Estate Ltd., Brokerage</div>
            <div>500 St.George Street<br/>Moncton, NB  E1C 1Y3</div>
            <div>Phone: 506-268-2900 &nbsp; Fax: 506-268-2910</div>
          </div>
          <br/>
          <div>${invoiceData.date}</div>
          <br/>
          <div style="font-weight: bold;">${invoiceData.brokerageName}</div>
          <div>${invoiceData.brokerageAddress}</div>
          <br/>
          <div><b>Re:</b> ${invoiceData.re}</div>
          <div>${invoiceData.tradeNumber ? `Trade #${invoiceData.tradeNumber}, ` : ""}${invoiceData.propertyAddress}</div>
          <br/>
          <div>To our commission of <b>${invoiceData.commissionDesc}</b></div>
          <div>${invoiceData.atAmountDesc}</div>
          <br/>
          <table class="amount-table">
            <tr>
              <td class="desc">Less share of MLS fees</td>
              <td class="right">$${Number(invoiceData.mlsFees || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td class="desc">HST # 804667350RT</td>
              <td class="right">$${Number(invoiceData.hst || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            <tr class="balance">
              <td class="desc">Balance Due on Closing</td>
              <td class="right">$${Number(invoiceData.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          </table>
          <div>Closing Scheduled for ${invoiceData.closingDate}.</div>
          <div>Our reference number is ${invoiceData.referenceNumber}.</div>
          <br/>
          <div style="font-weight: bold;">Please make cheque payable to Bestway Real Estate Ltd., Brokerage or adding by EFT using the Bank Details below:</div>
          <div class="bank-details">
            <b>Bank:</b> Royal Bank of Canada <br/>
            <b>Institution:</b> 003<br/>
            <b>Transit:</b> 02413<br/>
            <b>Account:</b> 101-1600<br/>
          </div>
          <div class="footer">
            Please feel free to contact our Deals department should you require more information/clarification. 506-268-2900. Or E-mail adminnb@bestwayrealtyinc.com.<br/><br/>
            Sincerely,<br/>
            Daphney Roy<br/>
            Administrator
          </div>
        </body>
        </html>
      `;
    }

    console.log('Generating PDF...');
    
    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(invoiceHTML, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({ 
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });
    
    await browser.close();
    
    console.log('PDF generated successfully');

    // Email content (simple text, since PDF is the main content)
    let emailText = '';
    let subject = '';
    
    if (invoiceType === 'lawyer') {
      emailText = `
Hello Dear Administrator

 ${invoiceData.lawyerName || 'Counselor'},

Please find attached the lawyer invoice for Trade #${invoiceData.tradeNumber}.

Property: ${invoiceData.propertyAddress}
Closing Date: ${invoiceData.closingDate}
Amount Due: $${Number(invoiceData.balanceToVendor || invoiceData.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

If you have any questions, please don't hesitate to contact us at 506-268-2900 or adminnb@bestwayrealtyinc.com.

Best regards,
Bestway Real Estate Ltd., Brokerage
500 St.George Street
Moncton, NB E1C 1Y3
Phone: 506-268-2900

Please confirm receipt of this email. 
Please Don't reply to this email.
      `;
      subject = `Lawyer Invoice - Trade #${invoiceData.tradeNumber || 'N/A'} - ${invoiceData.propertyAddress || ''}`;
    } else {
      emailText = `
Hello Dear Administrator

${invoiceData.brokerageName || 'Client'},

Please find attached the invoice for Trade #${invoiceData.tradeNumber}.

Property: ${invoiceData.propertyAddress}
Closing Date: ${invoiceData.closingDate}
Amount Due: $${Number(invoiceData.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

If you have any questions, please don't hesitate to contact us at 506-268-2900 or adminnb@bestwayrealtyinc.com.

Best regards,
Bestway Real Estate Ltd., Brokerage
500 St.George Street
Moncton, NB E1C 1Y3
Phone: 506-268-2900

Please confirm receipt of this email. Please
Don't reply to the sender email.
      `;
      subject = `Invoice - Trade #${invoiceData.tradeNumber || 'N/A'} - ${invoiceData.propertyAddress || ''}`;
    }

    const mailOptions = {
      from: `"Bestway Real Estate" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: subject,
      text: emailText,
      replyTo: process.env.EMAIL_USER,
      attachments: [
        {
          filename: `${invoiceType === 'lawyer' ? 'Lawyer-' : ''}Invoice-Trade-${invoiceData.tradeNumber || 'N-A'}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    console.log('Sending email with PDF attachment...');
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email with PDF sent successfully:', info.messageId);

    res.status(200).json({ 
      message: 'Invoice PDF sent successfully',
      messageId: info.messageId,
      recipientEmail: recipientEmail
    });

  } catch (error) {
    console.error('Error sending email with PDF:', error);
    
    let errorMessage = 'Failed to send invoice PDF';
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check your email credentials.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Could not connect to email server. Please check your internet connection.';
    } else if (error.message.includes('puppeteer')) {
      errorMessage = 'Failed to generate PDF. Please try again.';
    }
    
    res.status(500).json({ 
      message: errorMessage, 
      error: error.message 
    });
  }
});

// Test endpoint to verify email configuration
router.get('/test-connection', async (req, res) => {
  try {
    await transporter.verify();
    res.status(200).json({ 
      message: 'Mailwire SMTP service is configured correctly',
      service: 'Mailwire SMTP',
      user: process.env.EMAIL_USER
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Mailwire SMTP configuration error', 
      error: error.message,
      hint: 'Check Mailwire SMTP credentials and server settings in .env file'
    });
  }
});

module.exports = router;
