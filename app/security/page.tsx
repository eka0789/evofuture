import { Shield, Lock, Eye, FileCheck, Server, AlertTriangle } from 'lucide-react';

const securityFeatures = [
  {
    icon: Shield,
    title: 'Enterprise-Grade Security',
    description: 'Bank-level encryption and security protocols to protect your data at all times.',
  },
  {
    icon: Lock,
    title: 'Data Encryption',
    description: 'All data is encrypted in transit (TLS 1.3) and at rest (AES-256).',
  },
  {
    icon: Eye,
    title: 'Access Control',
    description: 'Role-based access control (RBAC) and multi-factor authentication support.',
  },
  {
    icon: FileCheck,
    title: 'Compliance',
    description: 'SOC 2 Type II, GDPR, and CCPA compliant infrastructure.',
  },
  {
    icon: Server,
    title: 'Infrastructure Security',
    description: 'Hosted on secure cloud infrastructure with 99.9% uptime SLA.',
  },
  {
    icon: AlertTriangle,
    title: 'Incident Response',
    description: '24/7 security monitoring and rapid incident response team.',
  },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Security</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your security is our top priority. Learn how we protect your data.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {securityFeatures.map((feature) => (
            <div
              key={feature.title}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border"
            >
              <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border">
            <h2 className="text-3xl font-bold mb-4">Security Practices</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                We employ industry-leading security practices to ensure your data remains safe and secure:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Regular security audits and penetration testing</li>
                <li>Automated vulnerability scanning and patching</li>
                <li>Comprehensive audit logging and monitoring</li>
                <li>Secure development lifecycle (SDLC) practices</li>
                <li>Employee security training and background checks</li>
                <li>Disaster recovery and business continuity planning</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border">
            <h2 className="text-3xl font-bold mb-4">Report a Vulnerability</h2>
            <p className="text-muted-foreground mb-4">
              We take security vulnerabilities seriously. If you discover a security issue,
              please report it to our security team immediately.
            </p>
            <p className="text-muted-foreground">
              Email: <a href="mailto:security@evolutionfuture.com" className="text-blue-600 hover:underline">
                security@evolutionfuture.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
