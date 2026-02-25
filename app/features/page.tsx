import { Shield, Zap, Users, BarChart, Lock, Globe, Smartphone, Cloud } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built with Next.js 14 and optimized for maximum performance. Experience blazing fast load times.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level security with encryption, role-based access control, and comprehensive audit logs.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Work together seamlessly with real-time collaboration tools and team management features.',
  },
  {
    icon: BarChart,
    title: 'Advanced Analytics',
    description: 'Get deep insights into your business with powerful analytics and customizable dashboards.',
  },
  {
    icon: Lock,
    title: 'Data Privacy',
    description: 'Your data is yours. We never sell or share your information with third parties.',
  },
  {
    icon: Globe,
    title: 'Global CDN',
    description: 'Deliver content at lightning speed to users worldwide with our global content delivery network.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Responsive',
    description: 'Perfect experience on any device. Fully responsive design that works on mobile, tablet, and desktop.',
  },
  {
    icon: Cloud,
    title: 'Cloud Infrastructure',
    description: 'Built on reliable cloud infrastructure that scales automatically with your needs.',
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Powerful Features</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to build, scale, and manage your digital business.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border hover:shadow-lg transition-shadow"
            >
              <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
