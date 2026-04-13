import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import { logAction, ActionType } from '@/lib/audit-logger';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Members() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'members'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMembers(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'members');
    });
    return () => unsubscribe();
  }, []);

  const addSampleMember = async () => {
    try {
      const docRef = await addDoc(collection(db, 'members'), {
        name: 'Jean Dupont',
        email: `jean.dupont.${Date.now()}@exemple.com`,
        phone: '+221 77 123 45 67',
        company: 'Tech Solutions SARL',
        status: 'active',
        joinDate: new Date().toISOString(),
        createdAt: serverTimestamp()
      });
      await logAction(ActionType.CREATE, 'members', docRef.id, 'Ajout d\'un membre d\'exemple');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'members');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Membres & Locataires</h1>
          <p className="text-zinc-500">Gérez vos clients et leurs informations de contact.</p>
        </div>
        <Button onClick={addSampleMember} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Membre
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input className="pl-10" placeholder="Rechercher un membre..." />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filtres
        </Button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50 hover:bg-zinc-50">
              <TableHead className="w-[300px]">Membre</TableHead>
              <TableHead>Entreprise</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date d'adhésion</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.photoUrl} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-zinc-900">{member.name}</p>
                      <p className="text-xs text-zinc-500">{member.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-zinc-600">{member.company || '-'}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn(
                    "capitalize",
                    member.status === 'active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-zinc-100 text-zinc-700"
                  )}>
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-zinc-600 text-sm">
                  {new Date(member.joinDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Mail className="w-4 h-4 text-zinc-400" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4 text-zinc-400" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {members.length === 0 && !loading && (
          <div className="py-12 text-center">
            <Users className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-900">Aucun membre</h3>
            <p className="text-zinc-500">Ajoutez votre premier membre pour commencer.</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { cn } from '@/lib/utils';
