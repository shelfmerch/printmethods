import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';

const DeveloperDashboard = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Developer Settings</h1>
          <p className="text-muted-foreground mt-1">
            Build integrations using the ShelfMerch Public API and Personal Access Tokens.
          </p>
        </div>

        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">API Documentation</h2>
              <p className="text-sm text-muted-foreground">
                View REST API reference, authentication details, and examples.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                window.open('/api/v1/docs', '_blank', 'noopener,noreferrer');
              }}
            >
              View API Docs
            </Button>
          </div>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Personal Access Tokens</h2>
              <p className="text-sm text-muted-foreground">
                Create and manage tokens for authenticating external applications with the ShelfMerch API.
              </p>
            </div>
            <Button
              onClick={() => navigate('/settings/developer/tokens')}
            >
              Manage Tokens
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DeveloperDashboard;

