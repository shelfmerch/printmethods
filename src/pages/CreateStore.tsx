import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Building2, Loader2 } from 'lucide-react';
import { storeApi } from '@/lib/api';
import type { Store as StoreType } from '@/types';

const COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Singapore',
  'Germany',
];

const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Retail',
  'Manufacturing',
  'Education',
  'Media & Entertainment',
  'Hospitality',
  'Professional Services',
  'Other',
];

const HEADCOUNT_OPTIONS = ['1-50', '51-200', '201-500', '500+'];

const HEADCOUNT_MAP: Record<string, number> = {
  '1-50': 50,
  '51-200': 200,
  '201-500': 500,
  '500+': 500,
};

const CreateStore = () => {
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('India');
  const [headcount, setHeadcount] = useState('');
  const [industry, setIndustry] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshStores } = useStore();

  useEffect(() => {
    if (user?.companyName) {
      setCompanyName(user.companyName);
    }
  }, [user?.companyName]);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error('You must be logged in');
      return;
    }
    if (!companyName.trim()) {
      toast.error('Company name is required');
      return;
    }
    if (!country) {
      toast.error('Country is required');
      return;
    }
    if (!headcount) {
      toast.error('Team size is required');
      return;
    }
    if (!industry) {
      toast.error('Industry is required');
      return;
    }

    setIsCreating(true);
    try {
      const response = await storeApi.create({
        name: companyName.trim(),
        theme: 'modern',
        country,
        brandProfile: {
          companyName: companyName.trim(),
          emailDomain: user?.emailDomain || '',
          country,
          industry,
          headcount: HEADCOUNT_MAP[headcount] || 0,
        },
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create brand store');
      }

      const store = response.data as StoreType;
      toast.success(`${companyName}'s swag store is live at ${store.subdomain}.shelfmerch.com`, {
        duration: 6000,
      });
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
      <Card className="w-full max-w-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Brand Onboarding</h1>
          <p className="text-muted-foreground text-sm">
            Submit your company details to create your brand store. Nothing is created until you finish this form.
          </p>
        </div>

        <form onSubmit={handleCreateStore} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              placeholder="Google, Amazon, Microsoft"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {COUNTRIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="headcount">Team Size *</Label>
            <select
              id="headcount"
              value={headcount}
              onChange={(e) => setHeadcount(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">Select team size</option>
              {HEADCOUNT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry *</Label>
            <select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
            {user?.emailDomain
              ? `We’ll use ${user.emailDomain} as your company email domain for the initial brand profile.`
              : 'Your signup email domain will be used for the initial brand profile.'}
          </div>

          <Button type="submit" className="w-full" disabled={isCreating}>
            {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Submit Brand Onboarding
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default CreateStore;
