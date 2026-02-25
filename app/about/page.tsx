import { Users, Target, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">About Evolution Future</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're building the future of digital business infrastructure
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Evolution Future was created to empower businesses of all sizes with enterprise-grade
              tools and infrastructure. We believe that powerful technology should be accessible,
              scalable, and easy to use.
            </p>
            <p className="text-lg text-muted-foreground">
              Our platform combines cutting-edge technology with intuitive design to help you build,
              scale, and manage your digital operations with confidence.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
            <p className="text-muted-foreground">
              To become the leading platform for digital business transformation worldwide
            </p>
          </div>

          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Our Team</h3>
            <p className="text-muted-foreground">
              A diverse group of engineers, designers, and business experts passionate about innovation
            </p>
          </div>

          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Our Values</h3>
            <p className="text-muted-foreground">
              Innovation, reliability, security, and customer success drive everything we do
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">By the Numbers</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
              <p className="text-muted-foreground">Active Users</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
              <p className="text-muted-foreground">Uptime</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <p className="text-muted-foreground">Countries</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <p className="text-muted-foreground">Support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
