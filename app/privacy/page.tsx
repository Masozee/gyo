import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          <div className="space-y-8">
            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle>Introduction</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  This Privacy Policy describes how your personal information is collected, used, and shared 
                  when you visit or interact with this website (the "Service") operated by the developer 
                  portfolio website.
                </p>
                <p>
                  We are committed to protecting your privacy and ensuring the security of your personal information. 
                  This policy explains what information we collect, how we use it, and your rights regarding your data.
                </p>
              </CardContent>
            </Card>

            {/* Information We Collect */}
            <Card>
              <CardHeader>
                <CardTitle>Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <h3>Information You Provide Directly</h3>
                <ul>
                  <li><strong>Contact Information:</strong> When you contact us through forms or email, we collect your name, email address, and message content.</li>
                  <li><strong>Newsletter Subscription:</strong> If you subscribe to our newsletter, we collect your email address.</li>
                  <li><strong>Comments:</strong> If you leave comments on blog posts, we collect your name, email, and comment content.</li>
                </ul>

                <h3>Information Collected Automatically</h3>
                <ul>
                  <li><strong>Usage Data:</strong> We collect information about how you use our website, including pages visited, time spent, and navigation patterns.</li>
                  <li><strong>Device Information:</strong> We collect information about your device, including IP address, browser type, operating system, and screen resolution.</li>
                  <li><strong>Cookies:</strong> We use cookies and similar technologies to improve your experience and analyze website usage.</li>
                </ul>
              </CardContent>
            </Card>

            {/* How We Use Information */}
            <Card>
              <CardHeader>
                <CardTitle>How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>We use the collected information for the following purposes:</p>
                <ul>
                  <li><strong>Communication:</strong> To respond to your inquiries and provide customer support</li>
                  <li><strong>Website Improvement:</strong> To analyze usage patterns and improve our website functionality</li>
                  <li><strong>Content Delivery:</strong> To personalize your experience and deliver relevant content</li>
                  <li><strong>Newsletter:</strong> To send you updates and articles (only if you've subscribed)</li>
                  <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
                  <li><strong>Security:</strong> To protect against fraud, abuse, and other harmful activities</li>
                </ul>
              </CardContent>
            </Card>

            {/* Information Sharing */}
            <Card>
              <CardHeader>
                <CardTitle>Information Sharing and Disclosure</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:</p>
                <ul>
                  <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who help us operate our website (e.g., hosting, analytics)</li>
                  <li><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights, property, or safety</li>
                  <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred</li>
                  <li><strong>Consent:</strong> We may share information with your explicit consent</li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card>
              <CardHeader>
                <CardTitle>Data Security</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  We implement appropriate technical and organizational security measures to protect your personal 
                  information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                </p>
                <ul>
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication procedures</li>
                  <li>Employee training on data protection practices</li>
                </ul>
                <p>
                  However, no method of transmission over the Internet or electronic storage is 100% secure. 
                  While we strive to protect your information, we cannot guarantee absolute security.
                </p>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card>
              <CardHeader>
                <CardTitle>Your Rights and Choices</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>You have the following rights regarding your personal information:</p>
                <ul>
                  <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal obligations)</li>
                  <li><strong>Portability:</strong> Request transfer of your data to another service provider</li>
                  <li><strong>Objection:</strong> Object to certain types of processing of your personal information</li>
                  <li><strong>Unsubscribe:</strong> Opt out of marketing communications at any time</li>
                </ul>
                <p>
                  To exercise these rights, please contact us using the information provided in the "Contact Us" section.
                </p>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card>
              <CardHeader>
                <CardTitle>Cookies and Tracking Technologies</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>We use cookies and similar tracking technologies to:</p>
                <ul>
                  <li>Remember your preferences and settings</li>
                  <li>Analyze website traffic and usage patterns</li>
                  <li>Improve website performance and user experience</li>
                  <li>Provide personalized content and recommendations</li>
                </ul>
                <p>
                  You can control cookie settings through your browser preferences. However, disabling cookies 
                  may limit some website functionality.
                </p>
              </CardContent>
            </Card>

            {/* Children's Privacy */}
            <Card>
              <CardHeader>
                <CardTitle>Children's Privacy</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  Our website is not intended for children under the age of 13. We do not knowingly collect 
                  personal information from children under 13. If you are a parent or guardian and believe 
                  your child has provided us with personal information, please contact us to have the 
                  information removed.
                </p>
              </CardContent>
            </Card>

            {/* Changes to Policy */}
            <Card>
              <CardHeader>
                <CardTitle>Changes to This Privacy Policy</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  We may update this Privacy Policy from time to time. When we make changes, we will update 
                  the "Last updated" date at the top of this policy and notify you of significant changes 
                  through our website or other means.
                </p>
                <p>
                  We encourage you to review this Privacy Policy periodically to stay informed about how 
                  we protect your information.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  If you have any questions about this Privacy Policy or our data practices, 
                  please contact us at:
                </p>
                <ul>
                  <li><strong>Email:</strong> privacy@yourdomain.com</li>
                  <li><strong>Website:</strong> Contact form at /contact</li>
                </ul>
                <p>
                  We will respond to your inquiry within a reasonable timeframe and work to 
                  address any concerns you may have.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}