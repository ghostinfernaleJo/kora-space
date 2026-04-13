import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import { logAction, ActionType } from '@/lib/audit-logger';
import { 
  Settings as SettingsIcon, 
  Shield, 
  UserCog, 
  Save,
  Search,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Settings() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });
    return () => unsubscribe();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId);
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: serverTimestamp()
      });
      await logAction(ActionType.UPDATE, 'users', userId, `Changement de rôle vers ${newRole}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Paramètres Système</h1>
          <p className="text-zinc-500">Gérez les accès, les rôles et les configurations globales.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                Gestion des Rôles & Accès
              </CardTitle>
              <CardDescription>
                Attribuez des rôles aux utilisateurs pour contrôler leurs permissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input className="pl-10" placeholder="Rechercher un utilisateur par nom ou email..." />
              </div>

              <div className="border border-zinc-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-50/50">
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle Actuel</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium text-zinc-900">{user.displayName || 'Utilisateur'}</TableCell>
                        <TableCell className="text-zinc-500 text-sm">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={
                            user.role === 'admin' ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                            user.role === 'manager' ? "bg-blue-50 text-blue-700 border-blue-100" :
                            "bg-zinc-50 text-zinc-700 border-zinc-100"
                          }>
                            {user.role || 'member'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Select 
                            defaultValue={user.role || 'member'} 
                            onValueChange={(value) => handleRoleChange(user.id, value)}
                            disabled={updating === user.id}
                          >
                            <SelectTrigger className="w-[130px] ml-auto">
                              <SelectValue placeholder="Changer rôle" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="accountant">Comptable</SelectItem>
                              <SelectItem value="member">Membre</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                Configuration Devise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100">
                <p className="text-sm font-medium text-indigo-900">Devise par défaut</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">FCFA (XOF)</p>
                <p className="text-xs text-indigo-500 mt-2 italic">
                  Toutes les transactions et factures utilisent cette devise.
                </p>
              </div>
              <Button variant="outline" className="w-full" disabled>
                Modifier la devise
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                Audit & Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-600">Journalisation active</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-600">Rétention des logs</span>
                <span className="font-medium">90 jours</span>
              </div>
              <Button variant="outline" className="w-full">
                Consulter les logs complets
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
