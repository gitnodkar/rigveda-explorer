import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useRigvedaData } from "@/hooks/useRigvedaData";
import { Loader2 } from "lucide-react";
import { DEITY_MAPPINGS, RISHI_MAPPINGS, METER_MAPPINGS, RIVERS, TRIBES } from "@/lib/helpers";

const COLORS = ['#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#3b82f6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#a855f7'];

const Visualize = () => {
  const { data, loading, error } = useRigvedaData();

  // Calculate mandala distribution
  const mandalaData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(v => {
      counts[v.mandala] = (counts[v.mandala] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([mandala, verses]) => ({
        name: `Mandala ${mandala}`,
        verses
      }));
  }, [data]);

  // Calculate deity counts (top 10) using mappings
  const deityData = useMemo(() => {
    const counts: Record<string, number> = {};
    // Group by English names
    const deityGroups: Record<string, string[]> = {};
    Object.entries(DEITY_MAPPINGS).forEach(([san, eng]) => {
      if (!deityGroups[eng]) deityGroups[eng] = [];
      deityGroups[eng].push(san);
    });
    // Count verses for each English deity
    Object.entries(deityGroups).forEach(([eng, sanskritVariants]) => {
      const count = data.filter(v => 
        sanskritVariants.some(variant => v.deity?.includes(variant))
      ).length;
      if (count > 0) counts[eng] = count;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [data]);

  // Calculate rishi counts (top 10) using mappings
  const rishiData = useMemo(() => {
    const counts: Record<string, number> = {};
    const rishiGroups: Record<string, string[]> = {};
    Object.entries(RISHI_MAPPINGS).forEach(([san, eng]) => {
      if (!rishiGroups[eng]) rishiGroups[eng] = [];
      rishiGroups[eng].push(san);
    });
    Object.entries(rishiGroups).forEach(([eng, sanskritVariants]) => {
      const count = data.filter(v => 
        sanskritVariants.some(variant => v.rishi?.includes(variant))
      ).length;
      if (count > 0) counts[eng] = count;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [data]);

  // Calculate meter counts (top 10) using mappings
  const meterData = useMemo(() => {
    const counts: Record<string, number> = {};
    const meterGroups: Record<string, string[]> = {};
    Object.entries(METER_MAPPINGS).forEach(([san, eng]) => {
      if (!meterGroups[eng]) meterGroups[eng] = [];
      meterGroups[eng].push(san);
    });
    Object.entries(meterGroups).forEach(([eng, sanskritVariants]) => {
      const count = data.filter(v => 
        sanskritVariants.some(variant => v.meter?.includes(variant))
      ).length;
      if (count > 0) counts[eng] = count;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [data]);

  // Calculate river mentions (top 10)
  const riverData = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.entries(RIVERS).forEach(([river, keywords]) => {
      let count = 0;
      keywords.forEach(keyword => {
        count += data.filter(v => 
          v.sanskrit?.includes(keyword) || 
          v.english_translation?.toLowerCase().includes(keyword.toLowerCase())
        ).length;
      });
      if (count > 0) counts[river] = count;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [data]);

  // Calculate tribe mentions (top 10)
  const tribeData = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.entries(TRIBES).forEach(([tribe, keywords]) => {
      let count = 0;
      keywords.forEach(keyword => {
        count += data.filter(v => 
          v.sanskrit?.includes(keyword) || 
          v.english_translation?.toLowerCase().includes(keyword.toLowerCase())
        ).length;
      });
      if (count > 0) counts[tribe] = count;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [data]);

  // Calculate sukta count
  const suktaCount = useMemo(() => {
    const suktas = new Set(data.map(v => `${v.mandala}.${v.sukta}`));
    return suktas.size;
  }, [data]);

  if (loading) {
    return (
      <div className="container py-8 max-w-7xl flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8 max-w-7xl">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          Error loading data: {error}
        </div>
      </div>
    );
  }
  return (
    <div className="container py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3">Visualize Data</h1>
        <p className="text-lg text-muted-foreground">
          Interactive charts and statistics from the Rigveda
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card className="stats-box">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary mb-1">{data.length.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total Verses</div>
          </CardContent>
        </Card>
        <Card className="stats-box">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary mb-1">{suktaCount.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Suktas</div>
          </CardContent>
        </Card>
        <Card className="stats-box">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary mb-1">33</div>
            <div className="text-xs text-muted-foreground">Total Deities</div>
          </CardContent>
        </Card>
        <Card className="stats-box">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary mb-1">10</div>
            <div className="text-xs text-muted-foreground">Mandalas</div>
          </CardContent>
        </Card>
        <Card className="stats-box">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary mb-1">100%</div>
            <div className="text-xs text-muted-foreground">Translated</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Mandala Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Verses Distribution by Mandala</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mandalaData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="verses"
                >
                  {mandalaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Deities */}
        <Card>
          <CardHeader>
            <CardTitle>🙏 Top 10 Deities by Verse Count</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} className="text-xs" />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Rishis */}
        <Card>
          <CardHeader>
            <CardTitle>👤 Top 10 Rishis/Clans</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rishiData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} className="text-xs font-devanagari" />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--secondary))" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Meters */}
        <Card>
          <CardHeader>
            <CardTitle>📏 Top 10 Poetic Meters</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={meterData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} className="text-xs font-devanagari" />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rivers Mentioned */}
        <Card>
          <CardHeader>
            <CardTitle>🌊 Top 10 Rivers Mentioned</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riverData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} className="text-xs" />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tribes Mentioned */}
        <Card>
          <CardHeader>
            <CardTitle>⚔️ Top 10 Tribes Mentioned</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tribeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} className="text-xs" />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Note */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Counts include all verses with any matching variant, including partial matches, for deities, rishis, and meters.
          </p>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="mt-8 bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3 text-lg">📈 About These Visualizations</h3>
          <p className="text-muted-foreground mb-4">
            These charts provide insights into the structure and content of the Rigveda:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• <strong>Mandala Distribution:</strong> Shows how verses are distributed across the 10 books (Mandalas)</li>
            <li>• <strong>Deity Analysis:</strong> Reveals which deities are most frequently addressed in hymns</li>
            <li>• <strong>Rishi Contributions:</strong> Identifies the most prolific Vedic seers and their families</li>
            <li>• <strong>Meter Patterns:</strong> Analyzes the poetic structures used in different hymns</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Visualize;
