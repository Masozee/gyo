import { db } from '../lib/db'
import { createEmail } from '../lib/email-storage'

async function seedEmails() {
  console.log('Seeding emails...')

  // Create some sample emails
  const sampleEmails = [
    {
      from: "john@example.com",
      fromName: "John Doe",
      to: "mail@nurojilukmansyah.com",
      subject: "Project Update - Q4 Planning",
      textContent: "Hi Nuroji, I wanted to give you an update on the Q4 planning project. We've made significant progress and I think you'll be pleased with the results so far. Key achievements this week: Completed the initial wireframes, Set up the development environment, Started working on the user authentication system. Let me know if you have any questions! Best regards, John",
      htmlContent: `<p>Hi Nuroji,</p>
      <p>I wanted to give you an update on the Q4 planning project. We've made significant progress and I think you'll be pleased with the results so far.</p>
      <p>Key achievements this week:</p>
      <ul>
        <li>Completed the initial wireframes</li>
        <li>Set up the development environment</li>
        <li>Started working on the user authentication system</li>
      </ul>
      <p>Let me know if you have any questions!</p>
      <p>Best regards,<br>John</p>`,
      folder: "inbox",
      isRead: false,
      isStarred: true,
      isImportant: true,
      labels: ["work", "important"],
      attachmentCount: 2,
      userId: 1
    },
    {
      from: "sarah@company.com",
      fromName: "Sarah Wilson",
      to: "mail@nurojilukmansyah.com",
      subject: "Meeting Reminder - Tomorrow 2PM",
      textContent: "Hi Nuroji, Just a quick reminder about our meeting tomorrow at 2PM. Please come prepared with your portfolio review and any questions you might have about the upcoming project. Meeting details: Time: 2:00 PM - 3:00 PM, Location: Conference Room A, Agenda: Portfolio review and project planning. See you tomorrow! Sarah",
      htmlContent: `<p>Hi Nuroji,</p>
      <p>Just a quick reminder about our meeting tomorrow at 2PM. Please come prepared with your portfolio review and any questions you might have about the upcoming project.</p>
      <p>Meeting details:</p>
      <ul>
        <li>Time: 2:00 PM - 3:00 PM</li>
        <li>Location: Conference Room A</li>
        <li>Agenda: Portfolio review and project planning</li>
      </ul>
      <p>See you tomorrow!</p>
      <p>Sarah</p>`,
      folder: "inbox",
      isRead: true,
      isStarred: false,
      isImportant: false,
      labels: ["work"],
      attachmentCount: 0,
      userId: 1
    },
    {
      from: "no-reply@github.com",
      fromName: "GitHub",
      to: "mail@nurojilukmansyah.com",
      subject: "[Repository] New Pull Request",
      textContent: "A new pull request has been opened for your repository. Repository: portfolio-website, Pull Request: Add new email functionality, Author: contributor-user. Please review the changes and provide feedback. You can view the pull request online at GitHub.",
      htmlContent: `<p>A new pull request has been opened for your repository.</p>
      <p><strong>Repository:</strong> portfolio-website</p>
      <p><strong>Pull Request:</strong> Add new email functionality</p>
      <p><strong>Author:</strong> contributor-user</p>
      <p>Please review the changes and provide feedback. You can view the pull request online at GitHub.</p>`,
      folder: "inbox",
      isRead: false,
      isStarred: false,
      isImportant: false,
      labels: ["projects"],
      attachmentCount: 0,
      userId: 1
    },
    {
      from: "client@business.com",
      fromName: "Alice Johnson",
      to: "mail@nurojilukmansyah.com",
      subject: "Website Feedback and Next Steps",
      textContent: "Dear Nuroji, Thank you for the website mockups. The team reviewed them and we have some feedback and suggestions for the next iteration. Feedback points: 1. The color scheme looks great - very professional, 2. Could we make the hero section more prominent?, 3. The navigation menu works well, 4. Mobile responsiveness is excellent. When can we schedule a call to discuss these changes? Best regards, Alice Johnson",
      htmlContent: `<p>Dear Nuroji,</p>
      <p>Thank you for the website mockups. The team reviewed them and we have some feedback and suggestions for the next iteration.</p>
      <p>Feedback points:</p>
      <ol>
        <li>The color scheme looks great - very professional</li>
        <li>Could we make the hero section more prominent?</li>
        <li>The navigation menu works well</li>
        <li>Mobile responsiveness is excellent</li>
      </ol>
      <p>When can we schedule a call to discuss these changes?</p>
      <p>Best regards,<br>Alice Johnson</p>`,
      folder: "inbox",
      isRead: true,
      isStarred: true,
      isImportant: false,
      labels: ["work", "projects"],
      attachmentCount: 1,
      userId: 1
    },
    {
      from: "newsletter@designnews.com",
      fromName: "Design News",
      to: "mail@nurojilukmansyah.com",
      subject: "Weekly Design Trends - January 2024",
      textContent: "This week's top design trends include: Minimalist layouts with plenty of white space, Bold typography that makes a statement, Innovative color schemes and gradients, Interactive micro-animations, Sustainable design practices. Stay tuned for next week's trends!",
      htmlContent: `<h2>Weekly Design Trends - January 2024</h2>
      <p>This week's top design trends include:</p>
      <ul>
        <li>Minimalist layouts with plenty of white space</li>
        <li>Bold typography that makes a statement</li>
        <li>Innovative color schemes and gradients</li>
        <li>Interactive micro-animations</li>
        <li>Sustainable design practices</li>
      </ul>
      <p>Stay tuned for next week's trends!</p>`,
      folder: "inbox",
      isRead: true,
      isStarred: false,
      isImportant: false,
      labels: ["personal"],
      attachmentCount: 0,
      userId: 1
    }
  ]

  for (const email of sampleEmails) {
    try {
      await createEmail(email)
      console.log(`Created email: ${email.subject}`)
    } catch (error) {
      console.error(`Failed to create email "${email.subject}":`, error)
    }
  }

  console.log('Email seeding completed!')
}

// Run the seeding function if this script is executed directly
if (require.main === module) {
  seedEmails().catch(console.error)
}

export { seedEmails }