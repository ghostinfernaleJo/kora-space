import React, { 
  Building2, 
  Users, 
  CalendarCheck, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const stats = [
  { name: 'Occupation Globale', value: '84%', icon: Building2, change: '+4.5%', trend: 'up' },
  { name: 'Membres Actifs', value: '124', icon: Users, change: '+12', trend: 'up' },
  { name: 'Réservations (Mois)', value: '48', icon: CalendarCheck, change: '-2', trend: 'down' },
  { name: 'Revenus (Mois)', value: '12,450 FCFA', icon: TrendingUp, change: '+18%', trend: 'up' },
];

const revenueData = [
  { name: 'Jan', revenue: 8500000, expenses: 4200000 },
  { name: 'Fév', revenue: 9200000, expenses: 4500000 },
  { name: 'Mar', revenue: 10500000, expenses: 4800000 },
  { name: 'Avr', revenue: 12450000, expenses: 5100000 },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Tableau de Bord</h1>
        <p className="text-zinc-500">Bienvenue sur votre espace de gestion CoWork.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <stat.icon className="w-5 h-5 text-indigo-600" />
                </div>
                <div className={cn(
                  "flex items-center text-xs font-medium",
                  stat.trend === 'up' ? "text-emerald-600" : "text-rose-600"
                )}>
                  {stat.change}
                  {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3 ml-1" /> : <ArrowDownRight className="w-3 h-3 ml-1" />}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-zinc-500 font-medium">{stat.name}</p>
                <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Performance Financière</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#71717a'}} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fill: '#71717a'}} 
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Activités Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1">
                    <div className="w-2 h-2 rounded-full bg-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">Nouvelle réservation : Salle A</p>
                    <p className="text-xs text-zinc-500">Par Jean Dupont • Il y a 2h</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
              Voir tout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
