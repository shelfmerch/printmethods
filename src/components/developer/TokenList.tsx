import { PersonalAccessToken } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Trash2 } from 'lucide-react';

interface TokenListProps {
  tokens: PersonalAccessToken[];
  onRevoke: (token: PersonalAccessToken) => void;
}

const maskTokenPrefix = (prefix: string) => {
  if (!prefix) return '********';
  // Prefix is already short; add mask
  return `${prefix}********`;
};

const formatDate = (iso?: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const TokenList: React.FC<TokenListProps> = ({ tokens, onRevoke }) => {
  if (!tokens.length) {
    return (
      <div className="rounded-md border border-dashed border-muted p-6 text-center text-sm text-muted-foreground">
        No Personal Access Tokens yet. Generate one to start using the ShelfMerch Public API.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr className="border-b">
            <th className="px-4 py-2 text-left font-medium">Name</th>
            <th className="px-4 py-2 text-left font-medium hidden md:table-cell">Token</th>
            <th className="px-4 py-2 text-left font-medium">Scopes</th>
            <th className="px-4 py-2 text-left font-medium whitespace-nowrap">Created</th>
            <th className="px-4 py-2 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr key={token.id} className="border-b last:border-b-0">
              <td className="px-4 py-2 align-top">
                <div className="font-medium">{token.name}</div>
                <div className="text-xs text-muted-foreground md:hidden">
                  {maskTokenPrefix(token.keyPrefix)}
                </div>
              </td>
              <td className="px-4 py-2 align-top hidden md:table-cell font-mono text-xs text-muted-foreground">
                {maskTokenPrefix(token.keyPrefix)}
              </td>
              <td className="px-4 py-2 align-top">
                <div className="max-w-xs truncate text-xs text-muted-foreground">
                  {token.scopes.join(', ')}
                </div>
              </td>
              <td className="px-4 py-2 align-top whitespace-nowrap text-xs text-muted-foreground">
                {formatDate(token.createdAt)}
              </td>
              <td className="px-4 py-2 align-top text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onRevoke(token)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Revoke
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TokenList;

