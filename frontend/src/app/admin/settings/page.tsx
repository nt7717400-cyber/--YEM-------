'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { ShowroomSettings } from '@/types';

export default function SettingsPage() {
  const [, setSettings] = useState<ShowroomSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Settings form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [mapLatitude, setMapLatitude] = useState('');
  const [mapLongitude, setMapLongitude] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.getSettings();
        setSettings(data);
        setName(data.name || '');
        setDescription(data.description || '');
        setAddress(data.address || '');
        setPhone(data.phone || '');
        setWhatsapp(data.whatsapp || '');
        setWorkingHours(data.workingHours || '');
        setMapLatitude(data.mapLatitude?.toString() || '');
        setMapLongitude(data.mapLongitude?.toString() || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ في جلب الإعدادات');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const updatedSettings = await api.updateSettings({
        name: name.trim(),
        description: description.trim(),
        address: address.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        workingHours: workingHours.trim(),
        mapLatitude: mapLatitude ? parseFloat(mapLatitude) : undefined,
        mapLongitude: mapLongitude ? parseFloat(mapLongitude) : undefined,
      });
      setSettings(updatedSettings);
      setSuccess('تم حفظ الإعدادات بنجاح');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في حفظ الإعدادات');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validate passwords
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('يرجى ملء جميع الحقول');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('كلمة المرور الجديدة غير متطابقة');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setIsChangingPassword(true);

    try {
      // Call password change API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${api.getToken()}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'حدث خطأ في تغيير كلمة المرور');
      }

      setPasswordSuccess('تم تغيير كلمة المرور بنجاح');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'حدث خطأ في تغيير كلمة المرور');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">الإعدادات</h1>

        {/* Showroom Settings */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات المعرض</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">اسم المعرض</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="معرض وحدة اليمن للسيارات"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">رقم الهاتف</label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+967 XXX XXX XXX"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">رقم الواتساب</label>
                  <Input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+967 XXX XXX XXX"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ساعات العمل</label>
                  <Input
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    placeholder="السبت - الخميس: 9 صباحاً - 9 مساءً"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">العنوان</label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="العنوان الكامل للمعرض"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">وصف المعرض</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="نبذة عن المعرض..."
                  className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">خط العرض (Latitude)</label>
                  <Input
                    type="number"
                    step="any"
                    value={mapLatitude}
                    onChange={(e) => setMapLatitude(e.target.value)}
                    placeholder="15.3694"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">خط الطول (Longitude)</label>
                  <Input
                    type="number"
                    step="any"
                    value={mapLongitude}
                    onChange={(e) => setMapLongitude(e.target.value)}
                    placeholder="44.1910"
                    dir="ltr"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle>تغيير كلمة المرور</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              {passwordError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
                  {passwordSuccess}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">كلمة المرور الحالية</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الحالية"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">كلمة المرور الجديدة</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">تأكيد كلمة المرور الجديدة</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                />
              </div>

              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
