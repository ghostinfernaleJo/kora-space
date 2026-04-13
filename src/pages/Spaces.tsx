import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import { cn } from '@/lib/utils';
import { logAction, ActionType } from '@/lib/audit-logger';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Users,
  Wifi,
  Coffee,
  Tv
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Spaces() {
  const [spaces, setSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'spaces'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSpaces(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'spaces');
    });
    return () => unsubscribe();
  }, []);

  const addSampleSpace = async () => {
    try {
      const docRef = await addDoc(collection(db, 'spaces'), {
        name: 'Bureau Privé A1',
        type: 'private',
        capacity: 4,
        price: 450000,
        billingCycle: 'month',
        status: 'available',
        equipments: ['Wifi', 'Coffee', 'Tv'],
        createdAt: serverTimestamp()
      });
      await logAction(ActionType.CREATE, 'spaces', docRef.id, 'Ajout d\'un espace d\'exemple');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'spaces');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Espaces & Ressources</h1>
          <p className="text-zinc-500">Gérez votre catalogue d'espaces et leur disponibilité.</p>
        </div>
        <Dialog>
          <DialogTrigger
            render={
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Nouvel Espace
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un espace</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Button onClick={addSampleSpace}>Ajouter un exemple rapidement</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input className="pl-10" placeholder="Rechercher un espace..." />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filtres
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spaces.map((space) => (
          <Card key={space.id} className="overflow-hidden group hover:border-indigo-200 transition-all">
            <div className="aspect-video bg-zinc-100 relative">
              <img 
                src={`https://picsum.photos/seed/${space.id}/400/225`} 
                alt={space.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <Badge className={cn(
                "absolute top-3 right-3",
                space.status === 'available' ? "bg-emerald-500" : "bg-amber-500"
              )}>
                {space.status === 'available' ? 'Disponible' : 'Occupé'}
              </Badge>
            </div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-zinc-900">{space.name}</h3>
                  <p className="text-sm text-zinc-500 capitalize">{space.type.replace('_', ' ')}</p>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="mt-6 flex items-center justify-between text-sm text-zinc-600">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{space.capacity} pers.</span>
                </div>
                <div className="flex gap-2">
                  {space.equipments?.includes('Wifi') && <Wifi className="w-4 h-4" />}
                  {space.equipments?.includes('Coffee') && <Coffee className="w-4 h-4" />}
                  {space.equipments?.includes('Tv') && <Tv className="w-4 h-4" />}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-100 flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-zinc-900">{space.price.toLocaleString()} FCFA</span>
                  <span className="text-xs text-zinc-500">/{space.billingCycle === 'month' ? 'mois' : 'jour'}</span>
                </div>
                <Button variant="outline" size="sm">Détails</Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {spaces.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-zinc-200 rounded-xl">
            <Building2 className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-900">Aucun espace trouvé</h3>
            <p className="text-zinc-500">Commencez par ajouter votre premier espace de travail.</p>
            <Button variant="outline" className="mt-4" onClick={addSampleSpace}>
              Ajouter un exemple
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
