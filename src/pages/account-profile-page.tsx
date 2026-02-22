import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { getAuthErrorMessage } from '@/lib/auth-errors';

export function AccountProfilePage() {
  const { activeCustomer, changeOwnPassword } = useAuth();

  const [username, setUsername] = useState(activeCustomer?.username ?? '');
  const [emailAddress, setEmailAddress] = useState(activeCustomer?.emailAddress ?? '');
  const [saved, setSaved] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  if (!activeCustomer) {
    return null;
  }

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      setPasswordError('Completa todos los campos de contrasena.');
      setPasswordSuccess('');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('La nueva contrasena y su confirmacion no coinciden.');
      setPasswordSuccess('');
      return;
    }

    setIsChangingPassword(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      await changeOwnPassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordSuccess('Contrasena actualizada correctamente.');
    } catch (error) {
      setPasswordError(getAuthErrorMessage(error));
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informacion de perfil</CardTitle>
          <CardDescription>Gestiona tu apodo y correo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account-username">Apodo</Label>
            <Input id="account-username" value={username} onChange={(event) => setUsername(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-email">Correo electronico</Label>
            <Input
              id="account-email"
              type="email"
              value={emailAddress}
              onChange={(event) => setEmailAddress(event.target.value)}
            />
          </div>
          <Button
            onClick={() => {
              if (!username.trim() || !emailAddress.trim()) {
                return;
              }

              setSaved(true);
              window.setTimeout(() => setSaved(false), 2000);
            }}
          >
            Guardar cambios
          </Button>
          {saved && <p className="text-sm text-muted-foreground">Cambios guardados localmente en esta demo.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seguridad</CardTitle>
          <CardDescription>Cambia tu contrasena actual.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account-current-password">Contrasena actual</Label>
              <Input
                id="account-current-password"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-new-password">Nueva contrasena</Label>
              <Input
                id="account-new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-confirm-new-password">Confirmar nueva contrasena</Label>
              <Input
                id="account-confirm-new-password"
                type="password"
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
                placeholder="••••••••"
              />
            </div>

            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
            {passwordSuccess && <p className="text-sm text-muted-foreground">{passwordSuccess}</p>}

            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? 'Actualizando...' : 'Cambiar contrasena'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
