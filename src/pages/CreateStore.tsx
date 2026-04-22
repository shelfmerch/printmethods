import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Building2, Check, Loader2, ChevronRight } from 'lucide-react';
import { storeApi } from '@/lib/api';
import type { Store as StoreType } from '@/types';

const REGIONS = ['India', 'Taiwan', 'Australia', 'New Zealand'];
const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing',
  'Education', 'Media & Entertainment', 'Hospitality', 'Other',
];
const HEADCOUNT_OPTIONS = [
  '1–50', '51–200', '201–500', '501–1000', '1000+',
];

const CreateStore = () => {
  // Step 1: brand identity  Step 2: regions & details
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 fields
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [emailDomain, setEmailDomain] = useState('');

  // Step 2 fields
  const [industry, setIndustry] = useState('');
  const [headcount, setHeadcount] = useState('');
  const [regions, setRegions] = useState<string[]>(['India']);
  const [primaryColor, setPrimaryColor] = useState('#000000');

  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { refreshStores } = useStore();

  const toggleRegion = (r: string) => {
    setRegions(prev =>
      prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]
    );
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) { toast.error('Company name is required'); return; }
    setStep(2);
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) { toast.error('You must be logged in'); return; }
    if (regions.length === 0) { toast.error('Select at least one region'); return; }

    setIsCreating(true);
    try {
      const response = await storeApi.create({
        name: companyName.trim(),
        theme: 'modern',
        brandProfile: {
          companyName: companyName.trim(),
          website: website.trim() || undefined,
          emailDomain: emailDomain.trim().toLowerCase() || undefined,
          industry: industry || undefined,
          headcount: headcount ? Number(headcount.split('–')[0].replace('+', '')) : undefined,
          regions,
          brandGuidelines: { primaryColor },
        },
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create brand store');
      }

      const store = response.data as StoreType;
      toast.success(`${companyName}'s swag store is live at ${store.subdomain}.shelfmerch.com`, { duration: 6000 });
      await refreshStores();
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create store. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Set Up Your Brand Store</h1>
          <p className="text-muted-foreground text-sm">
            {step === 1
              ? 'Tell us about your company — we\'ll create your private swag store.'
              : 'Almost done! Configure your store\'s reach and style.'}
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex-1">
              <div className={`h-2 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
              <p className={`text-xs mt-1 text-center font-medium ${s === step ? 'text-primary' : 'text-muted-foreground'}`}>
                {s === 1 ? 'Brand Identity' : 'Regions & Details'}
              </p>
            </div>
          ))}
        </div>

        {/* Step 1: Brand Identity */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                placeholder="e.g. Toast Inc."
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Company Website</Label>
              <Input
                id="website"
                placeholder="https://yourcompany.com"
                value={website}
                onChange={e => setWebsite(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailDomain">
                Employee Email Domain
                <span className="text-muted-foreground text-xs ml-2">(for employee invites)</span>
              </Label>
              <Input
                id="emailDomain"
                placeholder="yourcompany.com"
                value={emailDomain}
                onChange={e => setEmailDomain(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate(location.state?.from || '/dashboard')}
              >
                Skip for Now
              </Button>
              <Button type="submit" className="flex-1" disabled={!companyName.trim()}>
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </form>
        )}

        {/* Step 2: Regions & Details */}
        {step === 2 && (
          <form onSubmit={handleCreateStore} className="space-y-5">
            <div className="space-y-2">
              <Label>Shipping Regions *</Label>
              <p className="text-xs text-muted-foreground">Select where employees are located</p>
              <div className="grid grid-cols-2 gap-2">
                {REGIONS.map(r => (
                  <label
                    key={r}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      regions.includes(r) ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <Checkbox
                      checked={regions.includes(r)}
                      onCheckedChange={() => toggleRegion(r)}
                    />
                    <span className="text-sm font-medium">{r}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <select
                id="industry"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="headcount">Team Size</Label>
              <select
                id="headcount"
                value={headcount}
                onChange={e => setHeadcount(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select team size</option>
                {HEADCOUNT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryColor">Brand Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="primaryColor"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="h-10 w-16 rounded cursor-pointer border border-input"
                />
                <span className="text-sm text-muted-foreground font-mono">{primaryColor}</span>
              </div>
            </div>

            {/* Summary of what they get */}
            <div className="bg-accent/50 border border-accent-foreground/20 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-sm">Your brand store includes:</h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {[
                  'Private employee swag portal',
                  'Company credit wallet & gifting',
                  'Team member management',
                  'Order fulfillment & tracking',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={isCreating || regions.length === 0}>
                {isCreating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Store…</>
                ) : (
                  'Launch Brand Store'
                )}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default CreateStore;
