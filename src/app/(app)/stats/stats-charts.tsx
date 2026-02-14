"use client";

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
} from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

const COLORS = ["#2D8B4E", "#2471A3", "#D4A017", "#7D3C98", "#C0392B", "#1A1A1A"];

interface ChartData {
  name: string;
  value: number;
}

interface StatsChartsProps {
  categoryData: ChartData[];
  languageData: ChartData[];
  topAuthors: ChartData[];
  ratingData: ChartData[];
}

function StatsCharts({ categoryData, languageData, topAuthors, ratingData }: StatsChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Category distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Kategoriler</CardTitle>
        </CardHeader>
        {categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--st-grid-stroke)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }}
                stroke="var(--st-text-muted)"
              />
              <YAxis
                tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }}
                stroke="var(--st-text-muted)"
                allowDecimals={false}
              />
              <Tooltip />
              <Bar dataKey="value" fill="var(--st-accent-blue)" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-ink-muted text-center py-8">Veri yok</p>
        )}
      </Card>

      {/* Language distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Diller</CardTitle>
        </CardHeader>
        {languageData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={languageData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
                style={{ fontSize: 10, fontFamily: "IBM Plex Mono" }}
              >
                {languageData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-ink-muted text-center py-8">Veri yok</p>
        )}
      </Card>

      {/* Top authors */}
      <Card>
        <CardHeader>
          <CardTitle>En Çok Kitap</CardTitle>
        </CardHeader>
        {topAuthors.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topAuthors} layout="vertical">
              <CartesianGrid strokeDasharray="4 4" stroke="var(--st-grid-stroke)" />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }}
                stroke="var(--st-text-muted)"
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }}
                stroke="var(--st-text-muted)"
                width={100}
              />
              <Tooltip />
              <Bar dataKey="value" fill="var(--st-accent-green)" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-ink-muted text-center py-8">Veri yok</p>
        )}
      </Card>

      {/* Rating distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Puan Dağılımı</CardTitle>
        </CardHeader>
        {ratingData.some((d) => d.value > 0) ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ratingData}>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--st-grid-stroke)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }}
                stroke="var(--st-text-muted)"
              />
              <YAxis
                tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }}
                stroke="var(--st-text-muted)"
                allowDecimals={false}
              />
              <Tooltip />
              <Bar dataKey="value" fill="var(--st-accent-amber)" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-ink-muted text-center py-8">Henüz puan verilmemiş</p>
        )}
      </Card>
    </div>
  );
}

export { StatsCharts };
