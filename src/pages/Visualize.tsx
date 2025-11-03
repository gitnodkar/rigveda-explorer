// 3. Refactored Main Component: src/pages/visualize.tsx (or wherever it is)
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Checkbox } from "@/components/ui/checkbox"; // Not used here, but for stats if needed
import { Button } from "@/components/ui/button"; // Not used, but keep if needed
import { useRigvedaData } from "@/hooks/useRigvedaData";
import { Loader2 } from "lucide-react";
import { DEITY_MAPPINGS, RISHI_MAPPINGS, METER_MAPPINGS, RIVERS, TRIBES } from "@/lib/helpers";
import { RigvedaVerse } from "@/types/rigveda";
import VizCard from "@/components/ui/VizCard";
import { useCategoryData } from "@/hooks/useCategoryData";

const COLORS = [
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#10b981",
  "#3b82f6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
  "#14b8a6",
  "#a855f7",
];

const Visualize = () => {
  const { data, loading, error } = useRigvedaData();
  const [topNDeities, setTopNDeities] = useState(10);
  const [selectedDeities, setSelectedDeities] = useState<string[]>([]);
  const [topNRishis, setTopNRishis] = useState(10);
  const [selectedRishis, setSelectedRishis] = useState<string[]>([]);
  const [topNMeters, setTopNMeters] = useState(10);
  const [selectedMeters, setSelectedMeters] = useState<string[]>([]);
  const [topNRivers, setTopNRivers] = useState(10);
  const [selectedRivers, setSelectedRivers] = useState<string[]>([]);
  const [topNTribes, setTopNTribes] = useState(10);
  const [selectedTribes, setSelectedTribes] = useState<string[]>([]);

  // Pre-aggregate: Counts per category per Mandala (shared)
  const aggregatedData = useMemo(() => {
    const agg: {
      deities: Record<number, Record<string, number>>;
      rishis: Record<number, Record<string, number>>;
      meters: Record<number, Record<string, number>>;
      rivers: Record<number, Record<string, number>>;
      tribes: Record<number, Record<string, number>>;
    } = { deities: {}, rishis: {}, meters: {}, rivers: {}, tribes: {} };

    // Helper to count per mandala for structured mappings
    const countPerMandala = (
      items: Record<string, string[]>,
      field: keyof RigvedaVerse,
      key: "deities" | "rishis" | "meters"
    ) => {
      const groups: Record<string, string[]> = {};
      Object.entries(items).forEach(([san, eng]) => {
        if (!groups[eng]) groups[eng] = [];
        groups[eng].push(san);
      });
      data.forEach((v) => {
        const mandalaNum = parseInt(v.mandala);
        if (!agg[key][mandalaNum]) agg[key][mandalaNum] = {};
        Object.entries(groups).forEach(([eng, variants]) => {
          if (
            variants.some((variant) =>
              (v[field] as string)?.includes(variant)
            )
          ) {
            agg[key][mandalaNum][eng] = (agg[key][mandalaNum][eng] || 0) + 1;
          }
        });
      });
    };

    countPerMandala(DEITY_MAPPINGS, "deity", "deities");
    countPerMandala(RISHI_MAPPINGS, "rishi", "rishis");
    countPerMandala(METER_MAPPINGS, "meter", "meters");

    // Rivers/Tribes: Keyword matches per mandala
    const countMentionsPerMandala = (
      items: Record<string, string[]>,
      key: "rivers" | "tribes"
    ) => {
      Object.entries(items).forEach(([name, keywords]) => {
        data.forEach((v) => {
          const mandalaNum = parseInt(v.mandala);
          if (!agg[key][mandalaNum]) agg[key][mandalaNum] = {};
          if (
            keywords.some(
              (kw) =>
                v.sanskrit?.includes(kw) ||
                v.english_translation?.toLowerCase().includes(kw.toLowerCase())
            )
          ) {
            agg[key][mandalaNum][name] = (agg[key][mandalaNum][name] || 0) + 1;
          }
        });
      });
    };

    countMentionsPerMandala(RIVERS, "rivers");
    countMentionsPerMandala(TRIBES, "tribes");

    return agg;
  }, [data]);

  const mandalaData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((v) => {
      counts[v.mandala] = (counts[v.mandala] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([mandala, verses]) => ({
        name: `Mandala ${mandala}`,
        verses,
      }));
  }, [data]);

  const mandalaTotals = useMemo(() => {
    const totals: Record<number, number> = {};
    mandalaData.forEach(({ name, verses }) => {
      const num = parseInt(name.split(" ")[1]);
      totals[num] = verses;
    });
    return totals;
  }, [mandalaData]);

  const suktaCount = useMemo(() => {
    const suktas = new Set(data.map((v) => `${v.mandala}.${v.sukta}`));
    return suktas.size;
  }, [data]);

  // Use hook for each category
  const { categoryData: deityData, getDistributionData: getDeityDist, getShareData: getDeityShare } = useCategoryData('deities', topNDeities, aggregatedData, mandalaTotals);
  const { categoryData: rishiData, getDistributionData: getRishiDist, getShareData: getRishiShare } = useCategoryData('rishis', topNRishis, aggregatedData, mandalaTotals);
  const { categoryData: meterData, getDistributionData: getMeterDist, getShareData: getMeterShare } = useCategoryData('meters', topNMeters, aggregatedData, mandalaTotals);
  const { categoryData: riverData, getDistributionData: getRiverDist, getShareData: getRiverShare } = useCategoryData('rivers', topNRivers, aggregatedData, mandalaTotals);
  const { categoryData: tribeData, getDistributionData: getTribeDist, getShareData: getTribeShare } = useCategoryData('tribes', topNTribes, aggregatedData, mandalaTotals);

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
            <div className="text-3xl font-bold text-primary mb-1">
              {data.length.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total Verses</div>
          </CardContent>
        </Card>
        <Card className="stats-box">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary mb-1">
              {suktaCount.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total Suktas</div>
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
            <div className="text-3xl font-bold text-primary mb-1">33</div>
            <div className="text-xs text-muted-foreground">Total Deities</div>
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
        {/* Mandala Distribution Pie */}
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
                  label={({ percent }) => `${(percent * 100).toFixed(2)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="verses"
                  clockwise={true}
                  startAngle={90}
                  endAngle={450}
                >
                  {mandalaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* VizCards */}
        <VizCard
          category="deities"
          title={`Top ${topNDeities} Deities by Verse Count`}
          icon="🙏"
          barFill="hsl(var(--primary))"
          topN={topNDeities}
          setTopN={setTopNDeities}
          selected={selectedDeities}
          setSelected={setSelectedDeities}
          categoryData={deityData}
          getDistributionData={getDeityDist}
          getShareData={getDeityShare}
        />
        <VizCard
          category="rishis"
          title={`Top ${topNRishis} Rishis/Clans`}
          icon="👤"
          barFill="hsl(var(--secondary))"
          topN={topNRishis}
          setTopN={setTopNRishis}
          selected={selectedRishis}
          setSelected={setSelectedRishis}
          categoryData={rishiData}
          getDistributionData={getRishiDist}
          getShareData={getRishiShare}
          isDevanagari={true}
        />
        <VizCard
          category="meters"
          title={`Top ${topNMeters} Poetic Meters`}
          icon="📏"
          barFill="hsl(var(--accent))"
          topN={topNMeters}
          setTopN={setTopNMeters}
          selected={selectedMeters}
          setSelected={setSelectedMeters}
          categoryData={meterData}
          getDistributionData={getMeterDist}
          getShareData={getMeterShare}
          isDevanagari={true}
        />
        <VizCard
          category="rivers"
          title={`Top ${topNRivers} Rivers Mentioned`}
          icon="🌊"
          barFill="#3b82f6"
          topN={topNRivers}
          setTopN={setTopNRivers}
          selected={selectedRivers}
          setSelected={setSelectedRivers}
          categoryData={riverData}
          getDistributionData={getRiverDist}
          getShareData={getRiverShare}
        />
        <VizCard
          category="tribes"
          title={`Top ${topNTribes} Tribes Mentioned`}
          icon="⚔️"
          barFill="#10b981"
          topN={topNTribes}
          setTopN={setTopNTribes}
          selected={selectedTribes}
          setSelected={setSelectedTribes}
          categoryData={tribeData}
          getDistributionData={getTribeDist}
          getShareData={getTribeShare}
        />
      </div>

      {/* Note */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Counts include all verses with any matching variant, including partial matches, for deities, rishis, and meters. Rivers and tribes are keyword-based mentions.
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