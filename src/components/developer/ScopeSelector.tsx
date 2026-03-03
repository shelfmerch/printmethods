import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export const ALL_PAT_SCOPES: { id: string; label: string; description: string }[] = [
  { id: 'shops.read', label: 'shops.read', description: 'Read your shops and basic configuration.' },
  { id: 'catalog.read', label: 'catalog.read', description: 'Read blueprint catalog and variants.' },
  { id: 'products.read', label: 'products.read', description: 'Read products in your shops.' },
  { id: 'products.write', label: 'products.write', description: 'Create and update products.' },
  { id: 'orders.read', label: 'orders.read', description: 'Read orders and order statuses.' },
  { id: 'orders.write', label: 'orders.write', description: 'Update order statuses.' },
  { id: 'uploads.write', label: 'uploads.write', description: 'Upload artwork and assets.' },
  { id: 'webhooks.manage', label: 'webhooks.manage', description: 'Create and manage webhook subscriptions.' },
];

interface ScopeSelectorProps {
  value: string[];
  onChange: (next: string[]) => void;
}

const ScopeSelector: React.FC<ScopeSelectorProps> = ({ value, onChange }) => {
  const toggleScope = (scope: string, checked: boolean) => {
    if (checked) {
      if (!value.includes(scope)) {
        onChange([...value, scope]);
      }
    } else {
      onChange(value.filter((s) => s !== scope));
    }
  };

  return (
    <div className="space-y-2">
      {ALL_PAT_SCOPES.map((scope) => (
        <div key={scope.id} className="flex items-start gap-3">
          <Checkbox
            id={scope.id}
            checked={value.includes(scope.id)}
            onCheckedChange={(checked) => toggleScope(scope.id, Boolean(checked))}
          />
          <div>
            <Label htmlFor={scope.id} className="font-mono text-xs">
              {scope.label}
            </Label>
            <p className="text-xs text-muted-foreground">{scope.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScopeSelector;

