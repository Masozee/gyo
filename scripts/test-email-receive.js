// Test script to simulate receiving an email via webhook
const testEmailReceive = async () => {
  const testEmail = {
    messageId: `test-${Date.now()}`,
    from: 'test@example.com',
    fromName: 'Test Sender',
    to: 'mail@nurojilukmansyah.com',
    subject: `Test Email - ${new Date().toLocaleString()}`,
    textContent: 'This is a test email to verify the receiving functionality works correctly.',
    htmlContent: '<p>This is a <strong>test email</strong> to verify the receiving functionality works correctly.</p>',
    attachments: []
  }

  try {
    const response = await fetch('http://localhost:3001/api/mail/webhooks/general', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEmail)
    })

    if (response.ok) {
      console.log('✅ Test email sent successfully!')
      console.log('Check your inbox at http://localhost:3001/admin/mail/inbox')
    } else {
      const error = await response.text()
      console.error('❌ Failed to send test email:', error)
    }
  } catch (error) {
    console.error('❌ Network error:', error.message)
  }
}

testEmailReceive()