import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Terms of Service
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
                <CardTitle>Agreement to Terms</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  These Terms of Service ("Terms") constitute a legally binding agreement between you and the 
                  operator of this developer portfolio website ("we," "us," or "our"). By accessing or using 
                  our website, you agree to be bound by these Terms.
                </p>
                <p>
                  If you do not agree with any part of these Terms, you must not access or use our website. 
                  These Terms apply to all visitors, users, and others who access or use the service.
                </p>
              </CardContent>
            </Card>

            {/* Website Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description of Service</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>Our website is a developer portfolio that provides:</p>
                <ul>
                  <li>Information about development services and expertise</li>
                  <li>Portfolio showcase of completed projects</li>
                  <li>Technical blog posts and articles</li>
                  <li>Contact information for potential collaboration</li>
                  <li>Resources and insights related to web development</li>
                </ul>
                <p>
                  The website is provided for informational and promotional purposes. We reserve the right 
                  to modify, suspend, or discontinue any part of the service at any time without notice.
                </p>
              </CardContent>
            </Card>

            {/* Acceptable Use */}
            <Card>
              <CardHeader>
                <CardTitle>Acceptable Use Policy</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>You agree to use our website only for lawful purposes and in accordance with these Terms. You agree NOT to:</p>
                <ul>
                  <li>Use the website in any way that violates applicable laws or regulations</li>
                  <li>Transmit or distribute viruses, malware, or other harmful computer code</li>
                  <li>Attempt to gain unauthorized access to our systems or networks</li>
                  <li>Interfere with or disrupt the website's functionality or security</li>
                  <li>Use automated scripts, bots, or crawlers without permission</li>
                  <li>Collect or harvest personal information of other users</li>
                  <li>Post or transmit spam, unsolicited communications, or promotional materials</li>
                  <li>Impersonate any person or entity or misrepresent your affiliation</li>
                  <li>Engage in any activity that could damage our reputation or business</li>
                </ul>
              </CardContent>
            </Card>

            {/* Intellectual Property */}
            <Card>
              <CardHeader>
                <CardTitle>Intellectual Property Rights</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <h3>Our Content</h3>
                <p>
                  All content on this website, including but not limited to text, graphics, logos, images, 
                  code examples, and software, is the property of the website owner and is protected by 
                  copyright, trademark, and other intellectual property laws.
                </p>
                
                <h3>Limited License</h3>
                <p>
                  We grant you a limited, non-exclusive, non-transferable license to access and use our 
                  website for personal, non-commercial purposes, subject to these Terms.
                </p>

                <h3>Code Examples and Tutorials</h3>
                <p>
                  Code examples and tutorials provided on this website are for educational purposes. 
                  You may use and modify these examples for personal and commercial projects, but you 
                  cannot redistribute them as standalone products or claim them as your original work.
                </p>

                <h3>User-Generated Content</h3>
                <p>
                  By submitting comments, feedback, or other content to our website, you grant us a 
                  worldwide, royalty-free license to use, reproduce, and display such content in 
                  connection with our website and services.
                </p>
              </CardContent>
            </Card>

            {/* Professional Services */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Services</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <h3>Service Inquiries</h3>
                <p>
                  This website serves as a portfolio and may lead to discussions about potential 
                  professional services. Any actual work or services will be governed by separate 
                  written agreements.
                </p>

                <h3>No Guarantee of Services</h3>
                <p>
                  Nothing on this website constitutes an offer to provide services. All professional 
                  engagements are subject to availability, scope agreement, and execution of appropriate 
                  contracts.
                </p>

                <h3>Portfolio Accuracy</h3>
                <p>
                  While we strive to accurately represent our work and capabilities, portfolio items 
                  are presented for illustrative purposes. Actual results may vary based on specific 
                  project requirements and circumstances.
                </p>
              </CardContent>
            </Card>

            {/* Privacy and Data */}
            <Card>
              <CardHeader>
                <CardTitle>Privacy and Data Protection</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  Your privacy is important to us. Our collection and use of personal information is 
                  governed by our Privacy Policy, which is incorporated into these Terms by reference.
                </p>
                <p>
                  By using our website, you consent to the collection and use of your information as 
                  described in our Privacy Policy.
                </p>
              </CardContent>
            </Card>

            {/* Disclaimers */}
            <Card>
              <CardHeader>
                <CardTitle>Disclaimers and Limitations</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <h3>As-Is Basis</h3>
                <p>
                  Our website is provided on an "as-is" and "as-available" basis. We make no warranties, 
                  expressed or implied, regarding the website's operation, content accuracy, or availability.
                </p>

                <h3>Technical Information</h3>
                <p>
                  Technical information, code examples, and tutorials are provided for educational purposes 
                  only. We do not warrant that such information is error-free, complete, or suitable for 
                  any particular purpose.
                </p>

                <h3>External Links</h3>
                <p>
                  Our website may contain links to third-party websites. We are not responsible for the 
                  content, privacy practices, or terms of service of external sites.
                </p>

                <h3>Limitation of Liability</h3>
                <p>
                  To the fullest extent permitted by law, we shall not be liable for any indirect, 
                  incidental, special, consequential, or punitive damages arising from your use of our website.
                </p>
              </CardContent>
            </Card>

            {/* Indemnification */}
            <Card>
              <CardHeader>
                <CardTitle>Indemnification</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  You agree to indemnify, defend, and hold harmless the website operator from any claims, 
                  liabilities, damages, losses, costs, or expenses (including reasonable attorney fees) 
                  arising from:
                </p>
                <ul>
                  <li>Your use of the website</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any third-party rights</li>
                  <li>Any content you submit or transmit through the website</li>
                </ul>
              </CardContent>
            </Card>

            {/* Termination */}
            <Card>
              <CardHeader>
                <CardTitle>Termination</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  We reserve the right to terminate or suspend your access to our website immediately, 
                  without prior notice, for any reason, including breach of these Terms.
                </p>
                <p>
                  Upon termination, your right to use the website will cease immediately. All provisions 
                  of these Terms that by their nature should survive termination shall survive.
                </p>
              </CardContent>
            </Card>

            {/* Governing Law */}
            <Card>
              <CardHeader>
                <CardTitle>Governing Law and Jurisdiction</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the 
                  jurisdiction where the website operator is located, without regard to conflict of law principles.
                </p>
                <p>
                  Any disputes arising under these Terms shall be resolved through binding arbitration 
                  or in the courts of competent jurisdiction in the applicable location.
                </p>
              </CardContent>
            </Card>

            {/* Changes to Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  We reserve the right to modify these Terms at any time. When we make changes, we will 
                  update the "Last updated" date and post the revised Terms on our website.
                </p>
                <p>
                  Your continued use of the website after any changes constitutes acceptance of the new Terms. 
                  If you do not agree to the modified Terms, you must stop using our website.
                </p>
              </CardContent>
            </Card>

            {/* Severability */}
            <Card>
              <CardHeader>
                <CardTitle>Severability and Entire Agreement</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  If any provision of these Terms is found to be unenforceable or invalid, the remaining 
                  provisions will continue in full force and effect.
                </p>
                <p>
                  These Terms, together with our Privacy Policy, constitute the entire agreement between 
                  you and us regarding the use of our website and supersede all prior agreements and understandings.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <p>
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <ul>
                  <li><strong>Email:</strong> legal@yourdomain.com</li>
                  <li><strong>Website:</strong> Contact form at /contact</li>
                </ul>
                <p>
                  We will respond to your inquiry in a timely manner and work to address any concerns 
                  you may have regarding these Terms.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}