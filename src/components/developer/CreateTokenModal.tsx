import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ScopeSelector, { ALL_PAT_SCOPES } from './ScopeSelector';

interface CreateTokenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: { name: string; scopes: string[] }) => Promise<void>;
}

const CreateTokenModal: React.FC<CreateTokenModalProps> = ({ open, onOpenChange, onSubmit }) => {
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<string[]>(ALL_PAT_SCOPES.map((s) => s.id).slice(0, 5)); // sensible defaults
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (isSubmitting) return;
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    if (!scopes.length) return;
    try {
      setIsSubmitting(true);
      await onSubmit({ name: name.trim(), scopes });
      // Do not clear here; parent decides when to reset based on reveal modal lifecycle
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Generate New Token</DialogTitle>
          <DialogDescription>
            Create a Personal Access Token to authenticate external apps with the ShelfMerch Public API.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="pat-name">Token Name</Label>
            <Input
              id="pat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Integration App"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Use a human-friendly name so you can recognize this token later.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Scopes</Label>
            <ScopeSelector value={scopes} onChange={setScopes} />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim() || scopes.length === 0}
          >
            {isSubmitting ? 'Generating...' : 'Generate Token'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTokenModal;

