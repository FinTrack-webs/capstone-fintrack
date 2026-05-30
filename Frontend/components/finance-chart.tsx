"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ChartPoint } from "@/types/finance";
import { formatShortRupiah } from "@/utils/format";

type FinanceChartProps = {
  data: ChartPoint[];
};

export function FinanceChart({ data }: FinanceChartProps) {
  return (
    <div className="h-[360px] w-full min-w-0 overflow-visible pb-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 16, left: 10, bottom: 20 }}
        >
          <defs>
            <linearGradient id="pemasukan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1b6b51" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#1b6b51" stopOpacity={0} />
            </linearGradient>

            <linearGradient id="pengeluaran" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#002045" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#002045" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="#e3e2e6"
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            dy={10}
            tick={{ fill: "#74777f", fontSize: 12 }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            width={80}
            tick={{ fill: "#74777f", fontSize: 12 }}
            tickFormatter={formatShortRupiah}
          />

          <Tooltip
            formatter={(value: number) => formatShortRupiah(value)}
            contentStyle={{
              border: "1px solid rgba(196,198,207,.4)",
              borderRadius: 24,
              boxShadow: "0 18px 40px rgba(0,32,69,.14)",
            }}
          />

          <Area
            type="monotone"
            dataKey="pemasukan"
            stroke="#1b6b51"
            strokeWidth={3}
            fill="url(#pemasukan)"
          />

          <Area
            type="monotone"
            dataKey="pengeluaran"
            stroke="#002045"
            strokeWidth={3}
            fill="url(#pengeluaran)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
