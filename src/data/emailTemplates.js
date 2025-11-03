/**
 * Email Templates Library with Variables
 */

export const emailTemplates = [
  {
    id: 1,
    name: 'Welcome Email',
    category: 'Onboarding',
    subject: 'Welcome to {{company_name}}, {{customer_name}}!',
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Welcome to {{company_name}}!</h2>
      <p>Dear {{customer_name}},</p>
      <p>We're thrilled to have you on board! Your account has been successfully created.</p>
      <p>Here are your next steps:</p>
      <ul>
        <li>Complete your profile</li>
        <li>Explore our features</li>
        <li>Contact support if you need help</li>
      </ul>
      <p>Best regards,<br>{{agent_name}}<br>{{company_name}} Team</p>
    </div>`,
    variables: ['customer_name', 'company_name', 'agent_name'],
  },
  {
    id: 2,
    name: 'Follow-up Email',
    category: 'Support',
    subject: 'Following up on your inquiry - Ticket #{{ticket_id}}',
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Follow-up on Ticket #{{ticket_id}}</h2>
      <p>Hi {{customer_name}},</p>
      <p>I wanted to follow up on your recent inquiry regarding {{issue_description}}.</p>
      <p>We've reviewed your case and {{resolution_details}}.</p>
      <p>If you have any additional questions, please don't hesitate to reach out.</p>
      <p>Best regards,<br>{{agent_name}}<br>{{company_name}} Support Team</p>
    </div>`,
    variables: ['customer_name', 'ticket_id', 'issue_description', 'resolution_details', 'agent_name', 'company_name'],
  },
  {
    id: 3,
    name: 'Billing Invoice',
    category: 'Billing',
    subject: 'Your Invoice #{{invoice_number}} from {{company_name}}',
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Invoice #{{invoice_number}}</h2>
      <p>Dear {{customer_name}},</p>
      <p>Thank you for your business. Please find your invoice details below:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background: #f3f4f6;">
          <th style="padding: 10px; text-align: left;">Description</th>
          <th style="padding: 10px; text-align: right;">Amount</th>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{{item_description}}</td>
          <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">{{amount}}</td>
        </tr>
        <tr style="font-weight: bold;">
          <td style="padding: 10px;">Total</td>
          <td style="padding: 10px; text-align: right;">{{total_amount}}</td>
        </tr>
      </table>
      <p>Payment is due by {{due_date}}.</p>
      <p>Best regards,<br>{{agent_name}}<br>{{company_name}} Billing Team</p>
    </div>`,
    variables: ['customer_name', 'invoice_number', 'item_description', 'amount', 'total_amount', 'due_date', 'agent_name', 'company_name'],
  },
  {
    id: 4,
    name: 'Product Update',
    category: 'Marketing',
    subject: 'Exciting New Features at {{company_name}}!',
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">New Features Available!</h2>
      <p>Hi {{customer_name}},</p>
      <p>We're excited to announce new features that will enhance your experience:</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">{{feature_name}}</h3>
        <p>{{feature_description}}</p>
      </div>
      <p><a href="{{learn_more_link}}" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Learn More</a></p>
      <p>Best regards,<br>{{agent_name}}<br>{{company_name}} Team</p>
    </div>`,
    variables: ['customer_name', 'feature_name', 'feature_description', 'learn_more_link', 'agent_name', 'company_name'],
  },
  {
    id: 5,
    name: 'Appointment Confirmation',
    category: 'Scheduling',
    subject: 'Appointment Confirmed - {{appointment_date}}',
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Appointment Confirmation</h2>
      <p>Dear {{customer_name}},</p>
      <p>Your appointment has been confirmed for:</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Date:</strong> {{appointment_date}}</p>
        <p><strong>Time:</strong> {{appointment_time}}</p>
        <p><strong>Duration:</strong> {{duration}}</p>
        <p><strong>Location:</strong> {{location}}</p>
      </div>
      <p>If you need to reschedule, please contact us at least 24 hours in advance.</p>
      <p>Best regards,<br>{{agent_name}}<br>{{company_name}}</p>
    </div>`,
    variables: ['customer_name', 'appointment_date', 'appointment_time', 'duration', 'location', 'agent_name', 'company_name'],
  },
];

export const emailSignatures = [
  {
    id: 1,
    name: 'Professional',
    content: `<div style="font-family: Arial, sans-serif; border-top: 2px solid #4F46E5; padding-top: 10px; margin-top: 20px;">
      <p style="margin: 5px 0;"><strong>{{agent_name}}</strong></p>
      <p style="margin: 5px 0; color: #6b7280;">{{agent_title}}</p>
      <p style="margin: 5px 0; color: #6b7280;">{{company_name}}</p>
      <p style="margin: 5px 0; color: #6b7280;">📧 {{agent_email}} | 📞 {{agent_phone}}</p>
    </div>`,
  },
  {
    id: 2,
    name: 'Minimal',
    content: `<div style="font-family: Arial, sans-serif; margin-top: 20px;">
      <p style="margin: 5px 0;">{{agent_name}}</p>
      <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">{{agent_email}}</p>
    </div>`,
  },
  {
    id: 3,
    name: 'Detailed',
    content: `<div style="font-family: Arial, sans-serif; border-left: 4px solid #4F46E5; padding-left: 15px; margin-top: 20px;">
      <p style="margin: 5px 0; font-size: 16px;"><strong>{{agent_name}}</strong></p>
      <p style="margin: 5px 0; color: #6b7280;">{{agent_title}} | {{company_name}}</p>
      <p style="margin: 5px 0; color: #6b7280;">✉️ {{agent_email}}</p>
      <p style="margin: 5px 0; color: #6b7280;">📱 {{agent_phone}}</p>
      <p style="margin: 5px 0; color: #6b7280;">🌐 {{company_website}}</p>
    </div>`,
  },
];

export default emailTemplates;
