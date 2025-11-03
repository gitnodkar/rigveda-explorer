// 1. New Hook: src/hooks/useCategoryData.ts (or wherever your hooks are)
import { useMemo } from "react";
import { useRigvedaData } from "@/hooks/useRigvedaData";
import { DEITY_MAPPINGS, RISHI_MAPPINGS, METER_MAPPINGS, RIVERS, TRIBES } from "@/lib/helpers";
import { RigvedaVerse } from "@/types/rigveda";

interface CategoryData {
  categoryData: Array<{ name: string; value: number }>;
  getDistributionData: (selected: string[]) => any[];
  getShareData: (selected: string[]) => any[];
}

export const useCategoryData = (
  category: 'deities' | 'rishis' | 'meters' | 'rivers' | 'tribes',
  topN: number,
  aggregatedData: Record<string, Record<number, Record<string, number>>>,
  mandalaTotals: Record<number, number>
): CategoryData => {
  const { data } = useRigvedaData();

  const categoryData = useMemo(() => {
    let counts: Record<string, number> = {};
    switch (category) {
      case 'deities':
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
        break;
      case 'rishis':
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
        break;
      case 'meters':
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
        break;
      case 'rivers':
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
        break;
      case 'tribes':
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
        break;
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, topN)
      .map(([name, value]) => ({ name, value }));
  }, [data, category, topN]);

  const getDistributionData = useMemo(() => (selectedValues: string[]) => {
    if (selectedValues.length === 0) return [];

    const itemTotals: Record<string, number> = {};
    selectedValues.forEach((val) => {
      itemTotals[val] = Object.values(aggregatedData[category]).reduce((acc, m) => acc + (m[val] || 0), 0);
    });

    const validValues = selectedValues.filter(val => itemTotals[val] > 0);
    if (validValues.length === 0) return [];

    return Array.from({ length: 10 }, (_, i) => {
      const mandala = i + 1;
      const entry: Record<string, number> = { mandala, name: `M${mandala}` };
      validValues.forEach((val) => {
        const count = aggregatedData[category][mandala]?.[val] || 0;
        const itemTotal = itemTotals[val];
        entry[val] = itemTotal > 0 ? ((count / itemTotal) * 100) : 0;
      });
      return entry;
    });
  }, [aggregatedData, category]);

  const getShareData = useMemo(() => (selectedValues: string[]) => {
    if (selectedValues.length === 0) return [];

    const validValues = selectedValues.filter(val =>
      Object.values(aggregatedData[category]).some(m => m[val] > 0)
    );
    if (validValues.length === 0) return [];

    return Array.from({ length: 10 }, (_, i) => {
      const mandala = i + 1;
      const totalVerses = mandalaTotals[mandala] || 0;
      const entry: Record<string, number> = { mandala, name: `M${mandala}` };
      validValues.forEach((val) => {
        const count = aggregatedData[category][mandala]?.[val] || 0;
        entry[val] = totalVerses > 0 ? ((count / totalVerses) * 100) : 0;
      });
      return entry;
    });
  }, [aggregatedData, category, mandalaTotals]);

  return { categoryData, getDistributionData, getShareData };
};