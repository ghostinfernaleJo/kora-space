import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import { logAction, ActionType } from '@/lib/audit-logger';
import { 
  CalendarDays, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Clock,
  MapPin,
  User,
  Calendar,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Bookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'bookings'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bookings');
    });
    return () => unsubscribe();
  }, []);

  const addSampleBooking = async () => {
    try {
      const docRef = await addDoc(collection(db, 'bookings'), {
        spaceId: 'sample-space-id',
        spaceName: 'Salle de Réunion B',
        memberId: 'sample-member-id',
        memberName: 'Alice Martin',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 3600000 * 2).toISOString(),
        status: 'confirmed',
        totalPrice: 15000,
        createdAt: serverTimestamp()
      });
      await logAction(ActionType.CREATE, 'bookings', docRef.id, 'Ajout d\'une réservation d\'exemple');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'bookings');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Réservations & Contrats</h1>
          <p className="text-zinc-500">Suivez les occupations et le cycle de vie des contrats.</p>
        </div>
        <Button onClick={addSampleBooking} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Réservation
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input className="pl-10" placeholder="Rechercher une réservation..." />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filtres
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className="hover:border-indigo-200 transition-all">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <CalendarDays className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900">{booking.spaceName}</h3>
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <User className="w-3 h-3" />
                      <span>{booking.memberName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6">
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Date & Heure</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                      <Clock className="w-4 h-4 text-zinc-400" />
                      <span>{new Date(booking.startDate).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Montant</p>
                    <p className="text-sm font-bold text-zinc-900">{booking.totalPrice.toLocaleString()} FCFA</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Statut</p>
                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100 capitalize">
                      {booking.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">Contrat</Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4 text-zinc-400" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {bookings.length === 0 && !loading && (
          <div className="py-12 text-center border-2 border-dashed border-zinc-200 rounded-xl">
            <CalendarDays className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-900">Aucune réservation</h3>
            <p className="text-zinc-500">Les réservations de vos membres apparaîtront ici.</p>
          </div>
        )}
      </div>
    </div>
  );
}
