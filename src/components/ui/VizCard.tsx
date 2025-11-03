// 2. New Component: src/components/VizCard.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Legend,
} from "recharts";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VizCardProps {
  category: 'deities' | 'rishis' | 'meters' | 'rivers' | 'tribes';
  title: string;
  icon: string;
  barFill: string;
  topN: number;
  setTopN: (n: number) => void;
  selected: string[];
  setSelected: (sel: string[]) => void;
  categoryData: Array<{ name: string; value: number }>;
  getDistributionData: (sel: string[]) => any[];
  getShareData: (sel: string[]) => any[];
  isDevanagari?: boolean;
}
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
const VizCard: React.FC<VizCardProps> = ({
  category,
  title,
  icon,
  barFill,
  topN,
  setTopN,
  selected,
  setSelected,
  categoryData,
  getDistributionData,
  getShareData,
  isDevanagari = false,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  const handleExpand = () => {
    if (!expanded) {
      setSelected([]);
    }
    setExpanded(!expanded);
  };

  const toggleSelected = (value: string) => {
    setSelected(selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value]);
  };

  const getTopValues = () => categoryData.slice(0, topN).map(d => d.name);

  return (
    <Card className={expanded ? "md:col-span-2" : ""}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-4">
          <CardTitle>{icon} {title}</CardTitle>
          {expanded && (
            <div className="flex items-center space-x-2">
              <Label className="text-sm font-medium whitespace-nowrap">Show Top:</Label>
              <Select value={topN.toString()} onValueChange={(v) => setTopN(parseInt(v))}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={handleExpand}>
          {expanded ? "Close" : "Mandala Distro"}
        </Button>
      </CardHeader>
      <CardContent className={expanded ? "pt-0 pb-8" : ""}>
        <ResponsiveContainer width="100%" height={expanded ? 400 : 300}>
          <BarChart data={categoryData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} className={`text-xs ${isDevanagari ? 'font-devanagari' : ''}`} />
            <Tooltip />
            <Bar dataKey="value" fill={barFill} radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
        {expanded && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Select {category.charAt(0).toUpperCase() + category.slice(1)} (Top {topN})</h4>
              <div className="grid grid-cols-2 gap-4">
                {getTopValues().map((name) => (
                  <div key={name} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${category}-${name}`}
                      checked={selected.includes(name)}
                      onCheckedChange={() => toggleSelected(name)}
                    />
                    <Label htmlFor={`${category}-${name}`}>{name}</Label>
                  </div>
                ))}
              </div>
            </div>
            {selected.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Select items above to view distribution charts.</p>
            )}
            <div className="space-y-4">
              <div>
                <h5 className="font-medium mb-2">Distribution Across Mandalas</h5>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={getDistributionData(selected)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} angle={-45} textAnchor="end" height={70} className="text-xs" />
                    <YAxis unit="%" />
                    <Tooltip formatter={(value, name) => [`${value.toFixed(2)}%`, name || "Percentage"]} />
                    <Legend />
                    {selected.map((val, i) => (
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
                <p className="text-xs text-muted-foreground mt-1">
                  % of each {category}'s total mentions across all mandalas (sums to 100% per line).
                </p>
              </div>
              <div>
                <h5 className="font-medium mb-2">Share Within Each Mandala</h5>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={getShareData(selected)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} angle={-45} textAnchor="end" height={70} className="text-xs" />
                    <YAxis unit="%" />
                    <Tooltip formatter={(value, name) => [`${value.toFixed(2)}%`, name || "Percentage"]} />
                    <Legend />
                    {selected.map((val, i) => (
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
                <p className="text-xs text-muted-foreground mt-1">
                  % of each mandala's verses mentioning the selected {category} (may sum &gt;100% due to overlaps).
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VizCard;