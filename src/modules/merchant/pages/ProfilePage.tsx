import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '@/shared/components/layout/DashboardLayout';
import { useAuth } from '@/shared/contexts/AuthContext';
import { authApi } from '@/lib/api';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';

type EditStep = 'idle' | 'entering' | 'verifying';

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  // Email edit state
  const [emailStep, setEmailStep] = useState<EditStep>('idle');
  const [newEmail, setNewEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailServerOtp, setEmailServerOtp] = useState<string | undefined>();
  const [emailLoading, setEmailLoading] = useState(false);

  // Phone edit state
  const [phoneStep, setPhoneStep] = useState<EditStep>('idle');
  const [newPhone, setNewPhone] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await authApi.updateProfile(name);
      await refreshUser();
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Email flow ──────────────────────────────────────────────────────────────

  const handleSendEmailOtp = async () => {
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast.error('Enter a valid email address');
      return;
    }
    try {
      setEmailLoading(true);
      const res = await authApi.sendEmailVerificationLater(newEmail);
      setEmailServerOtp(res.serverOtp);
      setEmailStep('verifying');
      toast.success('OTP sent to ' + newEmail);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!emailOtp) {
      toast.error('Enter the OTP');
      return;
    }
    try {
      setEmailLoading(true);
      await authApi.confirmEmailVerificationLater(emailOtp, newEmail, emailServerOtp);
      await refreshUser();
      toast.success('Email updated successfully');
      setEmailStep('idle');
      setNewEmail('');
      setEmailOtp('');
      setEmailServerOtp(undefined);
    } catch (error: any) {
      toast.error(error.message || 'Invalid or expired OTP');
    } finally {
      setEmailLoading(false);
    }
  };

  const cancelEmailEdit = () => {
    setEmailStep('idle');
    setNewEmail('');
    setEmailOtp('');
    setEmailServerOtp(undefined);
  };

  // ── Phone flow ──────────────────────────────────────────────────────────────

  const handleSendPhoneOtp = async () => {
    if (!newPhone || !/^[6-9]\d{9}$/.test(newPhone)) {
      toast.error('Enter a valid 10-digit Indian mobile number');
      return;
    }
    try {
      setPhoneLoading(true);
      await authApi.sendPhoneVerificationLater(newPhone);
      setPhoneStep('verifying');
      toast.success('OTP sent to +91 ' + newPhone);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!phoneOtp) {
      toast.error('Enter the OTP');
      return;
    }
    try {
      setPhoneLoading(true);
      await authApi.confirmPhoneVerificationLater(phoneOtp, newPhone);
      await refreshUser();
      toast.success('Phone number updated successfully');
      setPhoneStep('idle');
      setNewPhone('');
      setPhoneOtp('');
    } catch (error: any) {
      toast.error(error.message || 'Invalid or expired OTP');
    } finally {
      setPhoneLoading(false);
    }
  };

  const cancelPhoneEdit = () => {
    setPhoneStep('idle');
    setNewPhone('');
    setPhoneOtp('');
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Profile</h1>
          <p className="text-muted-foreground">
            View and manage your ShelfMerch account details, business information, and preferences.
          </p>
        </header>

        {/* Contact Information */}
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Contact Information</h2>
            <p className="text-sm text-muted-foreground">
              All contact updates require OTP verification before being saved.
            </p>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email || 'Email not added'}</p>
              </div>
              {emailStep === 'idle' && (
                <Button variant="outline" size="sm" onClick={() => setEmailStep('entering')}>
                  {user?.email ? 'Edit' : 'Add'}
                </Button>
              )}
            </div>

            {emailStep === 'entering' && (
              <div className="space-y-2 pt-1">
                <Label htmlFor="newEmail">New email address</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="you@example.com"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendEmailOtp()}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSendEmailOtp} disabled={emailLoading}>
                    {emailLoading ? 'Sending…' : 'Send OTP'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEmailEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {emailStep === 'verifying' && (
              <div className="space-y-2 pt-1">
                <p className="text-sm text-muted-foreground">
                  Enter the OTP sent to <span className="font-medium">{newEmail}</span>
                </p>
                <Label htmlFor="emailOtp">OTP</Label>
                <Input
                  id="emailOtp"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit OTP"
                  maxLength={6}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyEmail()}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleVerifyEmail} disabled={emailLoading}>
                    {emailLoading ? 'Verifying…' : 'Verify & Save'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEmailStep('entering')}>
                    Back
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEmailEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Phone number</p>
                <p className="font-medium">
                  {user?.phoneNumber ? `+91 ${user.phoneNumber}` : 'Phone number not added'}
                </p>
              </div>
              {phoneStep === 'idle' && (
                <Button variant="outline" size="sm" onClick={() => setPhoneStep('entering')}>
                  {user?.phoneNumber ? 'Edit' : 'Add'}
                </Button>
              )}
            </div>

            {phoneStep === 'entering' && (
              <div className="space-y-2 pt-1">
                <Label htmlFor="newPhone">New mobile number (10 digits, India)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">+91</span>
                  <Input
                    id="newPhone"
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendPhoneOtp()}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSendPhoneOtp} disabled={phoneLoading}>
                    {phoneLoading ? 'Sending…' : 'Send OTP'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelPhoneEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {phoneStep === 'verifying' && (
              <div className="space-y-2 pt-1">
                <p className="text-sm text-muted-foreground">
                  Enter the OTP sent to <span className="font-medium">+91 {newPhone}</span>
                </p>
                <Label htmlFor="phoneOtp">OTP</Label>
                <Input
                  id="phoneOtp"
                  value={phoneOtp}
                  onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit OTP"
                  maxLength={6}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyPhone()}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleVerifyPhone} disabled={phoneLoading}>
                    {phoneLoading ? 'Verifying…' : 'Verify & Save'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setPhoneStep('entering')}>
                    Back
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelPhoneEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Profile Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Security & Access</h2>
            <p className="text-sm text-muted-foreground">
              Key information about how you access ShelfMerch.
            </p>
          </div>
          <ul className="space-y-2 text-sm list-disc list-inside">
            <li>Secure, email-based authentication.</li>
            <li>Access to dashboard, orders, stores, and analytics.</li>
            <li>Admin capabilities where applicable.</li>
          </ul>
        </Card>

        {/* Business Overview */}
        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Business Overview</h2>
            <p className="text-sm text-muted-foreground">
              High-level view of how you use ShelfMerch for your brand or business.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Use your profile together with the dashboard, stores, and analytics to build, launch, and scale your custom merchandise business.
          </p>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-destructive">
          <h2 className="text-xl font-semibold mb-4 text-destructive">Danger Zone</h2>
          <p className="text-sm text-muted-foreground mb-2">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button variant="destructive">Delete Account</Button>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
