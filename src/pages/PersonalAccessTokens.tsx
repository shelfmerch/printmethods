import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { developerPatApi, PersonalAccessToken, CreatePatResponse } from '@/lib/api';
import { toast } from 'sonner';
import CreateTokenModal from '@/components/developer/CreateTokenModal';
import TokenRevealModal from '@/components/developer/TokenRevealModal';
import TokenList from '@/components/developer/TokenList';

const PersonalAccessTokensPage = () => {
  const [tokens, setTokens] = useState<PersonalAccessToken[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [revealOpen, setRevealOpen] = useState<boolean>(false);
  const [newTokenValue, setNewTokenValue] = useState<string | null>(null);
  const [tokenBeingRevoked, setTokenBeingRevoked] = useState<PersonalAccessToken | null>(null);
  const [revoking, setRevoking] = useState<boolean>(false);

  const loadTokens = async () => {
    try {
      setLoading(true);
      const list = await developerPatApi.list();
      setTokens(list);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load tokens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTokens();
  }, []);

  const handleCreate = async (payload: { name: string; scopes: string[] }) => {
    try {
      const result: CreatePatResponse = await developerPatApi.create({
        name: payload.name,
        scopes: payload.scopes,
      });

      // Append to list using masked data
      setTokens((prev) => [
        {
          id: result.id,
          name: result.name,
          keyPrefix: result.keyPrefix,
          scopes: result.scopes,
          type: 'personal_access_token',
          planCode: 'unknown',
          createdAt: result.createdAt,
        },
        ...prev,
      ]);

      // Show reveal modal with full token once
      setNewTokenValue(result.key);
      setRevealOpen(true);
      setCreateOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create token');
    }
  };

  const handleRevealClose = () => {
    // Security: clear token from memory when modal closes
    setRevealOpen(false);
    setNewTokenValue(null);
  };

  const handleConfirmRevoke = async () => {
    if (!tokenBeingRevoked) return;
    try {
      setRevoking(true);
      await developerPatApi.revoke(tokenBeingRevoked.id);
      setTokens((prev) => prev.filter((t) => t.id !== tokenBeingRevoked.id));
      toast.success('Token revoked');
      setTokenBeingRevoked(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to revoke token');
    } finally {
      setRevoking(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Personal Access Tokens</h1>
          <p className="text-muted-foreground mt-1">
            Use Personal Access Tokens to authenticate external applications with the ShelfMerch Public API.
          </p>
        </div>

        <Card className="p-4 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Generate long-lived tokens scoped to specific operations such as reading shops, products, or orders.
            </p>
            <Button
              variant="link"
              className="px-0 text-xs"
              onClick={() => window.open('/api/v1/docs', '_blank', 'noopener,noreferrer')}
            >
              View API Documentation
            </Button>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            + Generate New Token
          </Button>
        </Card>

        <Card className="p-4 space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading tokens...</p>
          ) : (
            <TokenList
              tokens={tokens}
              onRevoke={(token) => setTokenBeingRevoked(token)}
            />
          )}
        </Card>
      </div>

      <CreateTokenModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />

      <TokenRevealModal
        open={revealOpen}
        tokenValue={newTokenValue}
        onClose={handleRevealClose}
      />

      <AlertDialog open={!!tokenBeingRevoked} onOpenChange={(open) => { if (!open) setTokenBeingRevoked(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke token</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke{' '}
              <span className="font-semibold text-foreground">
                {tokenBeingRevoked?.name ?? 'this token'}
              </span>
              ? This action cannot be undone and any integrations using this token will stop working immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revoking}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmRevoke}
              disabled={revoking}
            >
              {revoking ? 'Revoking...' : 'Yes, revoke token'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default PersonalAccessTokensPage;

