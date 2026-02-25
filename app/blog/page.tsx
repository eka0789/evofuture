import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';

const posts = [
  {
    id: 1,
    title: 'Getting Started with Evolution Future',
    excerpt: 'Learn how to set up your account and start building amazing products.',
    author: 'John Doe',
    date: '2024-02-20',
    category: 'Tutorial',
    readTime: '5 min read',
  },
  {
    id: 2,
    title: 'Best Practices for Team Collaboration',
    excerpt: 'Discover proven strategies to improve team productivity and communication.',
    author: 'Jane Smith',
    date: '2024-02-18',
    category: 'Productivity',
    readTime: '8 min read',
  },
  {
    id: 3,
    title: 'Security Features You Should Know',
    excerpt: 'Understanding the security measures that keep your data safe.',
    author: 'Mike Johnson',
    date: '2024-02-15',
    category: 'Security',
    readTime: '6 min read',
  },
  {
    id: 4,
    title: 'Scaling Your Business with Analytics',
    excerpt: 'How to use data-driven insights to grow your business effectively.',
    author: 'Sarah Williams',
    date: '2024-02-12',
    category: 'Analytics',
    readTime: '10 min read',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Insights, tutorials, and updates from the Evolution Future team.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge>{post.category}</Badge>
                  <span className="text-sm text-muted-foreground">{post.readTime}</span>
                </div>
                <CardTitle className="text-2xl">
                  <Link href={`/blog/${post.id}`} className="hover:text-blue-600">
                    {post.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.date).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
