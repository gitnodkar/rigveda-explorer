import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRigvedaData } from "@/hooks/useRigvedaData";
import { Loader2 } from "lucide-react";
import { DEITY_MAPPINGS, RISHI_MAPPINGS, METER_MAPPINGS, RIVERS, TRIBES } from "@/lib/helpers";
import { RigvedaVerse } from "@/types/rigveda"; // Added for TS

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
  const [expandedViz, setExpandedViz] = useState<string | null>(null);

  // States for selected values per viz
  const [selectedDeities, setSelectedDeities] = useState<string[]>([]);
  const [selectedRishis, setSelectedRishis] = useState<string[]>([]);
  const [selectedMeters, setSelectedMeters] = useState<string[]>([]);
  const [selectedRivers, setSelectedRivers] = useState<string[]>([]);
  const [selectedTribes, setSelectedTribes] = useState<string[]>([]);

  // Pre-aggregate: Counts per category per Mandala (for sub-charts)
  const aggregatedData = useMemo(() => {
    const agg: {
      deities: Record<number, Record<string, number>>;
      rishis: Record<number, Record<string, number>>;
      meters: Record<number, Record<string, number>>;
      rivers: Record<number, Record<string, number>>;
      tribes: Record<number, Record<string, number>>;
    } = { deities: {}, rishis: {}, meters: {}, rivers: {}, tribes: {} };

    // Helper to count per mandala
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

  // Existing memos (unchanged for default charts)
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

  const deityData = useMemo(() => {
    const counts: Record<string, number> = {};
    const deityGroups: Record<string, string[]> = {};
    Object.entries(DEITY_MAPPINGS).forEach(([san, eng]) => {
      if (!deityGroups[eng]) deityGroups[eng] = [];
      deityGroups[eng].push(san);
    });
    Object.entries(deityGroups).forEach(([eng, sanskritVariants]) => {
      const count = data.filter((v) =>
        sanskritVariants.some((variant) => v.deity?.includes(variant))
      ).length;
      if (count > 0) counts[eng] = count;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [data]);

  const rishiData = useMemo(() => {
    const counts: Record<string, number> = {};
    const rishiGroups: Record<string, string[]> = {};
    Object.entries(RISHI_MAPPINGS).forEach(([san, eng]) => {
      if (!rishiGroups[eng]) rishiGroups[eng] = [];
      rishiGroups[eng].push(san);
    });
    Object.entries(rishiGroups).forEach(([eng, sanskritVariants]) => {
      const count = data.filter((v) =>
        sanskritVariants.some((variant) => v.rishi?.includes(variant))
      ).length;
      if (count > 0) counts[eng] = count;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [data]);

  const meterData = useMemo(() => {
    const counts: Record<string, number> = {};
    const meterGroups: Record<string, string[]> = {};
    Object.entries(METER_MAPPINGS).forEach(([san, eng]) => {
      if (!meterGroups[eng]) meterGroups[eng] = [];
      meterGroups[eng].push(san);
    });
    Object.entries(meterGroups).forEach(([eng, sanskritVariants]) => {
      const count = data.filter((v) =>
        sanskritVariants.some((variant) => v.meter?.includes(variant))
      ).length;
      if (count > 0) counts[eng] = count;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [data]);

  const riverData = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.entries(RIVERS).forEach(([river, keywords]) => {
      let count = 0;
      keywords.forEach((keyword) => {
        count += data.filter((v) =>
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

  const tribeData = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.entries(TRIBES).forEach(([tribe, keywords]) => {
      let count = 0;
      keywords.forEach((keyword) => {
        count += data.filter((v) =>
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

  const suktaCount = useMemo(() => {
    const suktas = new Set(data.map((v) => `${v.mandala}.${v.sukta}`));
    return suktas.size;
  }, [data]);

  // Helper: Get unique top values for a category (for checkboxes)
  const getTopValues = (
    categoryData: Array<{ name: string; value: number }>,
    limit = 10
  ) => {
    return categoryData.slice(0, limit).map((d) => d.name);
  };

  // Helper: Compute sub-data for line chart (Mandala distro)
  const getSubData = (
    selectedValues: string[],
    aggKey: keyof typeof aggregatedData
  ) => {
    if (selectedValues.length === 0) return [];

    const totalSelected = selectedValues.reduce((sum, val) => {
      return (
        sum +
        Object.values(aggregatedData[aggKey]).reduce((acc, m) => acc + (m[val] || 0), 0)
      );
    }, 0);

    if (totalSelected === 0) return [];

    // Always generate all 10 Mandalas, no filtering
    return Array.from({ length: 10 }, (_, i) => {
      const mandala = i + 1;
      const entry: Record<string, number> = {
        mandala,
        name: `M${mandala}`, // Shorter label to fit
        ...selectedValues.reduce((acc, val) => {
          const count = aggregatedData[aggKey][mandala]?.[val] || 0;
          acc[val] = totalSelected > 0 ? ((count / totalSelected) * 100) : 0;
          return acc;
        }, {} as Record<string, number>)
      };
      return entry;
    }); // No .filter() - always show all 10
  };

  // Initialize selected on expand (default all top 10)
  const handleExpandDeities = () => {
    if (expandedViz !== "deities") {
      setSelectedDeities(getTopValues(deityData));
    }
    setExpandedViz(expandedViz === "deities" ? null : "deities");
  };

  const handleExpandRishis = () => {
    if (expandedViz !== "rishis") {
      setSelectedRishis(getTopValues(rishiData));
    }
    setExpandedViz(expandedViz === "rishis" ? null : "rishis");
  };

  const handleExpandMeters = () => {
    if (expandedViz !== "meters") {
      setSelectedMeters(getTopValues(meterData));
    }
    setExpandedViz(expandedViz === "meters" ? null : "meters");
  };

  const handleExpandRivers = () => {
    if (expandedViz !== "rivers") {
      setSelectedRivers(getTopValues(riverData));
    }
    setExpandedViz(expandedViz === "rivers" ? null : "rivers");
  };

  const handleExpandTribes = () => {
    if (expandedViz !== "tribes") {
      setSelectedTribes(getTopValues(tribeData));
    }
    setExpandedViz(expandedViz === "tribes" ? null : "tribes");
  };

  const toggleSelected = (
    value: string,
    selected: string[],
    setter: (vals: string[]) => void
  ) => {
    setter(selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value]);
  };

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
        {/* Mandala Distribution (Pie with Legend & Clockwise, 2-dec % ) */}
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

        {/* Top Deities (with Toggle - Expanded Height) */}
        <Card className={expandedViz === "deities" ? "md:col-span-2" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>🙏 Top 10 Deities by Verse Count</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExpandDeities}
            >
              {expandedViz === "deities" ? "Close" : "Mandala Distro"}
            </Button>
          </CardHeader>
          <CardContent className={expandedViz === "deities" ? "pt-0 pb-8" : ""}>
            <ResponsiveContainer width="100%" height={expandedViz === "deities" ? 400 : 300}>
              <BarChart data={deityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} className="text-xs" />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {expandedViz === "deities" && (
              <div className="mt-4 p-4 bg-muted rounded-lg"> {/* Removed max-h-96 overflow-y-auto */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Select Deities (Top 10)</h4>
                  <div className="grid grid-cols-2 gap-4"> {/* 2 cols, gap for space utilization */}
                    {getTopValues(deityData, 10).map((name) => (
                      <div key={name} className="flex items-center space-x-2">
                        <Checkbox
                          id={`deity-${name}`}
                          checked={selectedDeities.includes(name)}
                          onCheckedChange={(checked) => toggleSelected(name, selectedDeities, setSelectedDeities)}
                        />
                        <Label htmlFor={`deity-${name}`}>{name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={getSubData(selectedDeities, "deities")}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      interval={0} // Show all ticks
                      angle={-45} // Rotate for fit
                      textAnchor="end"
                      height={70}
                      className="text-xs"
                    />
                    <YAxis unit="%" />
                    <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, "Percentage"]} />
                    <Legend />
                    {selectedDeities.map((val, i) => (
                      <Line
                        key={val}
                        type="monotone"
                        dataKey={val}
                        stroke={COLORS[i % COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-2">
                  Distribution (% of selected deities) across Mandalas.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Rishis (with Toggle - Expanded Height) */}
        <Card className={expandedViz === "rishis" ? "md:col-span-2" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>👤 Top 10 Rishis/Clans</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExpandRishis}
            >
              {expandedViz === "rishis" ? "Close" : "Mandala Distro"}
            </Button>
          </CardHeader>
          <CardContent className={expandedViz === "rishis" ? "pt-0 pb-8" : ""}>
            <ResponsiveContainer width="100%" height={expandedViz === "rishis" ? 400 : 300}>
              <BarChart data={rishiData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} className="text-xs font-devanagari" />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--secondary))" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {expandedViz === "rishis" && (
              <div className="mt-4 p-4 bg-muted rounded-lg"> {/* Removed max-h-96 overflow-y-auto */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Select Rishis (Top 10)</h4>
                  <div className="grid grid-cols-2 gap-4"> {/* 2 cols, gap for space utilization */}
                    {getTopValues(rishiData, 10).map((name) => (
                      <div key={name} className="flex items-center space-x-2">
                        <Checkbox
                          id={`rishi-${name}`}
                          checked={selectedRishis.includes(name)}
                          onCheckedChange={(checked) => toggleSelected(name, selectedRishis, setSelectedRishis)}
                        />
                        <Label htmlFor={`rishi-${name}`}>{name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={getSubData(selectedRishis, "rishis")}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      interval={0} // Show all ticks
                      angle={-45} // Rotate for fit
                      textAnchor="end"
                      height={70}
                      className="text-xs"
                    />
                    <YAxis unit="%" />
                    <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, "Percentage"]} />
                    <Legend />
                    {selectedRishis.map((val, i) => (
                      <Line
                        key={val}
                        type="monotone"
                        dataKey={val}
                        stroke={COLORS[i % COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-2">
                  Distribution (% of selected rishis) across Mandalas.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Meters (with Toggle - Expanded Height) */}
        <Card className={expandedViz === "meters" ? "md:col-span-2" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>📏 Top 10 Poetic Meters</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExpandMeters}
            >
              {expandedViz === "meters" ? "Close" : "Mandala Distro"}
            </Button>
          </CardHeader>
          <CardContent className={expandedViz === "meters" ? "pt-0 pb-8" : ""}>
            <ResponsiveContainer width="100%" height={expandedViz === "meters" ? 400 : 300}>
              <BarChart data={meterData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} className="text-xs font-devanagari" />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {expandedViz === "meters" && (
              <div className="mt-4 p-4 bg-muted rounded-lg"> {/* Removed max-h-96 overflow-y-auto */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Select Meters (Top 10)</h4>
                  <div className="grid grid-cols-2 gap-4"> {/* 2 cols, gap for space utilization */}
                    {getTopValues(meterData, 10).map((name) => (
                      <div key={name} className="flex items-center space-x-2">
                        <Checkbox
                          id={`meter-${name}`}
                          checked={selectedMeters.includes(name)}
                          onCheckedChange={(checked) => toggleSelected(name, selectedMeters, setSelectedMeters)}
                        />
                        <Label htmlFor={`meter-${name}`}>{name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={getSubData(selectedMeters, "meters")}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      interval={0} // Show all ticks
                      angle={-45} // Rotate for fit
                      textAnchor="end"
                      height={70}
                      className="text-xs"
                    />
                    <YAxis unit="%" />
                    <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, "Percentage"]} />
                    <Legend />
                    {selectedMeters.map((val, i) => (
                      <Line
                        key={val}
                        type="monotone"
                        dataKey={val}
                        stroke={COLORS[i % COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-2">
                  Distribution (% of selected meters) across Mandalas.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rivers Mentioned (with Toggle - Expanded Height) */}
        <Card className={expandedViz === "rivers" ? "md:col-span-2" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>🌊 Top 10 Rivers Mentioned</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExpandRivers}
            >
              {expandedViz === "rivers" ? "Close" : "Mandala Distro"}
            </Button>
          </CardHeader>
          <CardContent className={expandedViz === "rivers" ? "pt-0 pb-8" : ""}>
            <ResponsiveContainer width="100%" height={expandedViz === "rivers" ? 400 : 300}>
              <BarChart data={riverData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} className="text-xs" />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {expandedViz === "rivers" && (
              <div className="mt-4 p-4 bg-muted rounded-lg"> {/* Removed max-h-96 overflow-y-auto */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Select Rivers (Top 10)</h4>
                  <div className="grid grid-cols-2 gap-4"> {/* 2 cols, gap for space utilization */}
                    {getTopValues(riverData, 10).map((name) => (
                      <div key={name} className="flex items-center space-x-2">
                        <Checkbox
                          id={`river-${name}`}
                          checked={selectedRivers.includes(name)}
                          onCheckedChange={(checked) => toggleSelected(name, selectedRivers, setSelectedRivers)}
                        />
                        <Label htmlFor={`river-${name}`}>{name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={getSubData(selectedRivers, "rivers")}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      interval={0} // Show all ticks
                      angle={-45} // Rotate for fit
                      textAnchor="end"
                      height={70}
                      className="text-xs"
                    />
                    <YAxis unit="%" />
                    <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, "Percentage"]} />
                    <Legend />
                    {selectedRivers.map((val, i) => (
                      <Line
                        key={val}
                        type="monotone"
                        dataKey={val}
                        stroke={COLORS[i % COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-2">
                  Distribution (% of selected rivers) across Mandalas.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tribes Mentioned (with Toggle - Expanded Height) */}
        <Card className={expandedViz === "tribes" ? "md:col-span-2" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>⚔️ Top 10 Tribes Mentioned</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExpandTribes}
            >
              {expandedViz === "tribes" ? "Close" : "Mandala Distro"}
            </Button>
          </CardHeader>
          <CardContent className={expandedViz === "tribes" ? "pt-0 pb-8" : ""}>
            <ResponsiveContainer width="100%" height={expandedViz === "tribes" ? 400 : 300}>
              <BarChart data={tribeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} className="text-xs" />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {expandedViz === "tribes" && (
              <div className="mt-4 p-4 bg-muted rounded-lg"> {/* Removed max-h-96 overflow-y-auto */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Select Tribes (Top 10)</h4>
                  <div className="grid grid-cols-2 gap-4"> {/* 2 cols, gap for space utilization */}
                    {getTopValues(tribeData, 10).map((name) => (
                      <div key={name} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tribe-${name}`}
                          checked={selectedTribes.includes(name)}
                          onCheckedChange={(checked) => toggleSelected(name, selectedTribes, setSelectedTribes)}
                        />
                        <Label htmlFor={`tribe-${name}`}>{name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={getSubData(selectedTribes, "tribes")}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      interval={0} // Show all ticks
                      angle={-45} // Rotate for fit
                      textAnchor="end"
                      height={70}
                      className="text-xs"
                    />
                    <YAxis unit="%" />
                    <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, "Percentage"]} />
                    <Legend />
                    {selectedTribes.map((val, i) => (
                      <Line
                        key={val}
                        type="monotone"
                        dataKey={val}
                        stroke={COLORS[i % COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-2">
                  Distribution (% of selected tribes) across Mandalas.
                </p>
              </div>
            )}
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