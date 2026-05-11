import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { RAW_API_URL } from '@/config';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';

type InviteState = {
  status: 'loading' | 'accepted' | 'error';
  message: string;
};

const AcceptBrandTeamInvite = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [inviteState, setInviteState] = useState<InviteState>({
    status: 'loading',
    message: 'Accepting your invitation...',
  });

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setInviteState({ status: 'error', message: 'This invitation link is missing its token.' });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(`${RAW_API_URL}/api/brand-team/accept`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'This invitation link is invalid or expired.');
        }
        if (!cancelled) {
          setInviteState({
            status: 'accepted',
            message: data.message || 'Invitation accepted. You can now open your dashboard.',
          });
        }
      } catch (error: any) {
        if (!cancelled) {
          setInviteState({
            status: 'error',
            message: error.message || 'Could not accept this invitation.',
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const Icon = inviteState.status === 'loading'
    ? Loader2
    : inviteState.status === 'accepted'
      ? CheckCircle
      : XCircle;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <Icon
          className={`mx-auto mb-5 h-14 w-14 ${
            inviteState.status === 'loading'
              ? 'animate-spin text-muted-foreground'
              : inviteState.status === 'accepted'
                ? 'text-green-600'
                : 'text-destructive'
          }`}
        />
        <h1 className="text-2xl font-semibold">
          {inviteState.status === 'accepted'
            ? 'Invitation Accepted'
            : inviteState.status === 'error'
              ? 'Invitation Link Not Working'
              : 'Accepting Invitation'}
        </h1>
        <p className="mt-3 text-muted-foreground">{inviteState.message}</p>
        {inviteState.status !== 'loading' && (
          <div className="mt-6 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
            <Button className="flex-1" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AcceptBrandTeamInvite;
