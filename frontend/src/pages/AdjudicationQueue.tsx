import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { subjectsApi } from '../lib/api';

// Subject type
interface Subject {
  id: string;
  subject_name: string;
  risk_score: number;
  status: string;
  created_at: string;
  assigned_to: string;
}

export const AdjudicationQueue = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await subjectsApi.getSubjects({
          status: 'flagged,pending',
          sort_by: 'risk_score',
          sort_order: 'desc',
          limit: 50
        }) as { items?: Subject[] };
        setSubjects(response.items || []);
      } catch (error) {
        console.error("Failed to fetch subjects", error);
        // Fallback to empty array
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
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
                  <th className="p-4">Subject Name</th>
                  <th className="p-4">Risk Score</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date Detected</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-4 font-medium text-primary">{subject.subject_name}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        subject.risk_score > 70
                          ? 'bg-danger/10 text-danger'
                          : subject.risk_score > 50
                          ? 'bg-yellow-500/10 text-yellow-500'
                          : 'bg-green-500/10 text-green-500'
                      }`}>
                        {subject.risk_score}%
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {subject.status === 'flagged' ? (
                          <AlertCircle className="w-4 h-4 text-danger" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className="capitalize">{subject.status}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {subject.created_at ? new Date(subject.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4">
                      <Link
                        to={`/case/${subject.id}`}
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
