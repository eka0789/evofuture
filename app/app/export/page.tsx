'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileJson, FileText, Database } from 'lucide-react';

export default function ExportPage() {
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: string) => {
    setExporting(true);
    
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: format.toLowerCase() }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export-${Date.now()}.${format.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        alert(`Successfully exported data in ${format} format`);
      } else {
        alert('Export failed. Please try again.');
      }
    } catch (error) {
      alert('An error occurred during export.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Export Data</h1>
        <p className="text-muted-foreground mt-2">
          Download your data in various formats
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <FileJson className="h-12 w-12 text-blue-600 mb-4" />
            <CardTitle>JSON Export</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Export all your data in JSON format for easy integration
            </p>
            <Button
              onClick={() => handleExport('JSON')}
              disabled={exporting}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <FileText className="h-12 w-12 text-green-600 mb-4" />
            <CardTitle>CSV Export</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Export data in CSV format for spreadsheet applications
            </p>
            <Button
              onClick={() => handleExport('CSV')}
              disabled={exporting}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Database className="h-12 w-12 text-purple-600 mb-4" />
            <CardTitle>Full Backup</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Complete database backup including all relationships
            </p>
            <Button
              onClick={() => handleExport('Backup')}
              disabled={exporting}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Create Backup
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No exports yet. Create your first export above.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
