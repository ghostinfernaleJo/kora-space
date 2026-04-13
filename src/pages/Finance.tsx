import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import { logAction, ActionType } from '@/lib/audit-logger';
import { 
  Banknote, 
  Plus, 
  Search, 
  Filter,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MoreVertical,
  Receipt
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
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function Finance() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'invoices'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvoices(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'invoices');
    });
    return () => unsubscribe();
  }, []);

  const addSampleInvoice = async () => {
    try {
      const docRef = await addDoc(collection(db, 'invoices'), {
        memberId: 'sample-member-id',
        memberName: 'Alice Martin',
        number: `FAC-2025-${Math.floor(Math.random() * 1000)}`,
        amount: 450000,
        date: new Date().toISOString(),
        dueDate: new Date(Date.now() + 3600000 * 24 * 7).toISOString(),
        status: 'sent',
        createdAt: serverTimestamp()
      });
      await logAction(ActionType.CREATE, 'invoices', docRef.id, 'Ajout d\'une facture d\'exemple');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'invoices');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Facturation & Finance</h1>
          <p className="text-zinc-500">Gérez vos revenus, factures et suivis de paiements.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={addSampleInvoice} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Facture
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-indigo-600 text-white">
          <CardContent className="p-6">
            <p className="text-indigo-100 text-sm font-medium">Total Encaissé (Mois)</p>
            <p className="text-3xl font-bold mt-2">8,420,000 FCFA</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-indigo-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>92% de taux de recouvrement</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-zinc-500 text-sm font-medium">En attente de paiement</p>
            <p className="text-3xl font-bold mt-2 text-zinc-900">1,250,000 FCFA</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-amber-600">
              <AlertCircle className="w-4 h-4" />
              <span>4 factures en retard</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-zinc-500 text-sm font-medium">Projections (Mois prochain)</p>
            <p className="text-3xl font-bold mt-2 text-zinc-900">14,800,000 FCFA</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              <span>+12% vs mois dernier</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50">
              <TableHead>N° Facture</TableHead>
              <TableHead>Membre</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-mono text-xs font-bold text-zinc-600">{invoice.number}</TableCell>
                <TableCell className="font-medium text-zinc-900">{invoice.memberName}</TableCell>
                <TableCell className="text-zinc-500 text-sm">{new Date(invoice.date).toLocaleDateString()}</TableCell>
                <TableCell className="font-bold text-zinc-900">{invoice.amount.toLocaleString()} FCFA</TableCell>
                <TableCell>
                  <Badge className={cn(
                    "capitalize",
                    invoice.status === 'paid' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  )}>
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <FileText className="w-4 h-4 text-zinc-400" />
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
