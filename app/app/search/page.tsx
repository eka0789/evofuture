'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, FileText, Users, Activity } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      
      // Transform API results to match UI format
      const transformedResults: any[] = [];
      
      if (data.results.activities) {
        data.results.activities.forEach((activity: any) => {
          transformedResults.push({
            type: 'activity',
            title: activity.action,
            description: activity.description || new Date(activity.createdAt).toLocaleString(),
            icon: Activity,
          });
        });
      }
      
      if (data.results.notifications) {
        data.results.notifications.forEach((notification: any) => {
          transformedResults.push({
            type: 'notification',
            title: notification.title,
            description: notification.message,
            icon: FileText,
          });
        });
      }
      
      setResults(transformedResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-muted-foreground mt-2">Find anything across your workspace</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search for activities, users, documents..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 text-lg h-12"
        />
      </div>

      {query && (
        <div className="space-y-4">
          {results.length > 0 ? (
            results.map((result, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <result.icon className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">{result.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{result.description}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No results found for "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
