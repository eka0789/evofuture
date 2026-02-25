import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

const releases = [
  {
    version: '1.0.0',
    date: '2026-02-25',
    changes: [
      { type: 'feature', description: 'Initial release with core features' },
      { type: 'feature', description: 'User authentication with Google OAuth' },
      { type: 'feature', description: 'Dashboard with analytics' },
      { type: 'feature', description: 'Activity logging and audit trail' },
      { type: 'feature', description: 'Notification system' },
      { type: 'feature', description: 'Dark mode support' },
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Changelog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track all updates, improvements, and new features
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {releases.map((release) => (
            <div key={release.version} className="bg-white dark:bg-gray-800 rounded-2xl p-8 border">
              <div className="flex items-center gap-4 mb-6">
                <Badge className="text-lg px-4 py-1">v{release.version}</Badge>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(release.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>

              <div className="space-y-3">
                {release.changes.map((change, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Badge
                      variant={
                        change.type === 'feature'
                          ? 'default'
                          : change.type === 'fix'
                          ? 'success'
                          : 'secondary'
                      }
                      className="mt-0.5"
                    >
                      {change.type}
                    </Badge>
                    <p className="text-muted-foreground flex-1">{change.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
