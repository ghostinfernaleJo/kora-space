import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import { logAction, ActionType } from '@/lib/audit-logger';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter,
  Tag,
  Calendar,
  CreditCard,
  FileCheck,
  MoreVertical,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

export default function Expenses() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'expenses'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'expenses');
    });
    return () => unsubscribe();
  }, []);

  const addSampleExpense = async () => {
    try {
      const docRef = await addDoc(collection(db, 'expenses'), {
        category: 'energy',
        amount: 125000,
        date: new Date().toISOString(),
        supplier: 'Senelec',
        description: 'Facture électricité Mars 2025',
        status: 'paid',
        createdAt: serverTimestamp()
      });
      await logAction(ActionType.CREATE, 'expenses', docRef.id, 'Ajout d\'une dépense d\'exemple');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'expenses');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Dépenses Opérationnelles</h1>
          <p className="text-zinc-500">Suivez vos charges et optimisez la rentabilité.</p>
        </div>
        <Button onClick={addSampleExpense} className="bg-rose-600 hover:bg-rose-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Saisir une Dépense
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Loyer & Charges</p>
            <p className="text-xl font-bold mt-1">3,200,000 FCFA</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Énergie & Fluides</p>
            <p className="text-xl font-bold mt-1">450,000 FCFA</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Maintenance</p>
            <p className="text-xl font-bold mt-1">180,000 FCFA</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Total Dépenses</p>
            <p className="text-xl font-bold mt-1 text-rose-600">3,830,000 FCFA</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50">
              <TableHead>Catégorie</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Justificatif</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Tag className="w-3 h-3 text-zinc-400" />
                    <span className="capitalize font-medium text-zinc-900">{expense.category}</span>
                  </div>
                </TableCell>
                <TableCell className="text-zinc-600">{expense.supplier}</TableCell>
                <TableCell className="text-zinc-500 text-sm">{new Date(expense.date).toLocaleDateString()}</TableCell>
                <TableCell className="font-bold text-zinc-900">{expense.amount.toLocaleString()} FCFA</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize border-emerald-200 text-emerald-700 bg-emerald-50">
                    {expense.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <FileCheck className="w-4 h-4 text-zinc-400" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import { cn } from '@/lib/utils';
