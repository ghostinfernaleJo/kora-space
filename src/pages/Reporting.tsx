import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const monthlyData = [
  { name: 'Jan', revenus: 4500000, depenses: 2100000 },
  { name: 'Fév', revenus: 5200000, depenses: 2300000 },
  { name: 'Mar', revenus: 4800000, depenses: 2200000 },
  { name: 'Avr', revenus: 6100000, depenses: 2800000 },
  { name: 'Mai', revenus: 5900000, depenses: 2600000 },
  { name: 'Juin', revenus: 7200000, depenses: 3100000 },
];

const occupancyData = [
  { name: 'Bureaux Privés', value: 85 },
  { name: 'Open Space', value: 65 },
  { name: 'Salles Réunion', value: 45 },
  { name: 'Événements', value: 30 },
];

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

export default function Reporting() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(data);
    }, (error) => {
      // Silent fail for logs if not admin
      console.warn('Audit logs access restricted or failed');
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Reporting & Analyses</h1>
          <p className="text-zinc-500">Visualisez les performances de votre espace en temps réel.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Période
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Download className="w-4 h-4 mr-2" />
            Rapport PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Revenus vs Dépenses</CardTitle>
            <CardDescription>Évolution financière sur les 6 derniers mois (FCFA)</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                <Tooltip 
                  formatter={(value: any) => `${value.toLocaleString()} FCFA`}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="revenus" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Revenus" />
                <Bar dataKey="depenses" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Dépenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taux d'Occupation par Type</CardTitle>
            <CardDescription>Répartition de l'utilisation des ressources (%)</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {occupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 min-w-[150px]">
              {occupancyData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-xs text-zinc-600">{item.name}</span>
                  <span className="text-xs font-bold ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Journal d'Audit Récent</CardTitle>
            <CardDescription>Trace des dernières opérations effectuées sur le système.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-3 rounded-lg bg-zinc-50 border border-zinc-100">
                  <div className={cn(
                    "mt-1 p-1.5 rounded-full",
                    log.action === 'CREATE' ? "bg-emerald-100 text-emerald-600" :
                    log.action === 'DELETE' ? "bg-rose-100 text-rose-600" :
                    "bg-blue-100 text-blue-600"
                  )}>
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900">
                      <span className="font-bold">{log.userName}</span> a {log.action.toLowerCase()} un(e) {log.resource}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">{log.details}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-medium text-zinc-400 uppercase">
                      {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString() : 'A l\'instant'}
                    </p>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="py-8 text-center text-zinc-500 italic text-sm">
                  Aucune activité récente ou accès restreint.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>KPIs de Croissance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Nouveaux Membres</span>
                <span className="font-bold text-emerald-600">+12%</span>
              </div>
              <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[70%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Taux de Rétention</span>
                <span className="font-bold text-indigo-600">94%</span>
              </div>
              <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[94%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Marge Opérationnelle</span>
                <span className="font-bold text-amber-600">32%</span>
              </div>
              <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[32%]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
