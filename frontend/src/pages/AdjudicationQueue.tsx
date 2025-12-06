import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

// Placeholder type - will be replaced by generated types later
interface AnalysisResult {
  id: string;
  subject_id: string;
  risk_score: number;
  status: string;
  adjudication_status: string;
  created_at: string;
}

export const AdjudicationQueue = () => {
  const [cases, setCases] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, use React Query and proper API client
    const fetchQueue = async () => {
      try {
        // Simulating API response for UI development
        setCases([
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            subject_id: 'subject-001',
            risk_score: 0.85,
            status: 'completed',
            adjudication_status: 'flagged',
            created_at: new Date().toISOString()
          },
          {
            id: '223e4567-e89b-12d3-a456-426614174001',
            subject_id: 'subject-002',
            risk_score: 0.65,
            status: 'completed',
            adjudication_status: 'pending',
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
        ]);
      } catch (error) {
        console.error("Failed to fetch queue", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();
  }, []);

  if (loading) return <div className="p-8 text-muted-foreground">Loading queue...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Adjudication Queue</h2>
          <p className="text-muted-foreground">Review flagged cases and high-risk subjects.</p>
        </div>
        <Button>
          Refresh Queue
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Cases</CardTitle>
          <CardDescription>Cases requiring immediate attention.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/50 text-muted-foreground font-medium">
                <tr>
                  <th className="p-4">Subject ID</th>
                  <th className="p-4">Risk Score</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date Detected</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-4 font-mono text-primary">{c.subject_id}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        c.risk_score > 0.7 
                          ? 'bg-danger/10 text-danger' 
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {(c.risk_score * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {c.adjudication_status === 'flagged' ? (
                          <AlertCircle className="w-4 h-4 text-danger" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className="capitalize">{c.adjudication_status}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <Link 
                        to={`/adjudication/${c.id}`}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 rounded-md px-3"
                      >
                        Review Case
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
