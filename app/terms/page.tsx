export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-8">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: February 25, 2026</p>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using Evolution Future, you accept and agree to be bound by the
                terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
              <p className="text-muted-foreground">
                Permission is granted to temporarily access the materials on Evolution Future for
                personal, non-commercial transitory viewing only.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
              <p className="text-muted-foreground mb-2">When you create an account with us, you must:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account</li>
                <li>Promptly update any information to keep it accurate</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Prohibited Uses</h2>
              <p className="text-muted-foreground mb-2">You may not use our service:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>For any unlawful purpose</li>
                <li>To violate any international, federal, or state regulations</li>
                <li>To infringe upon intellectual property rights</li>
                <li>To transmit malicious code or viruses</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Service Modifications</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify or discontinue our service at any time without notice.
                We shall not be liable to you or any third party for any modification, suspension,
                or discontinuance of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                Evolution Future shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages resulting from your use of or inability to use
                the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Contact Information</h2>
              <p className="text-muted-foreground">
                For questions about these Terms of Service, please contact us at
                legal@evolutionfuture.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
