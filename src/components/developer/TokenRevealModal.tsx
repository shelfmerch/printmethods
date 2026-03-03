import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface TokenRevealModalProps {
  open: boolean;
  tokenValue: string | null;
  onClose: () => void;
}

const TokenRevealModal: React.FC<TokenRevealModalProps> = ({ open, tokenValue, onClose }) => {
  // Security: when modal closes, parent should clear tokenValue from state.
  useEffect(() => {
    if (!open) {
      // no-op here; parent is responsible for clearing tokenValue
    }
  }, [open]);

  const handleCopy = async () => {
    if (!tokenValue) return;
    try {
      await navigator.clipboard.writeText(tokenValue);
      toast.success('Token copied to clipboard');
    } catch {
      toast.error('Failed to copy token');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Token Created Successfully</DialogTitle>
          <DialogDescription>
            This Personal Access Token will only be shown once. Copy it now and store it in a secure password manager.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label>Personal Access Token</Label>
            <Input
              value={tokenValue ?? ''}
              readOnly
              className="font-mono text-xs"
            />
          </div>
          <div className="rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-xs text-yellow-900">
            <p className="font-semibold">Security notice</p>
            <p>
              This token grants API access to your account. Treat it like a password.
              You will not be able to see the full value again after closing this dialog.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCopy} disabled={!tokenValue}>
            Copy Token
          </Button>
          <Button
            onClick={onClose}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TokenRevealModal;

