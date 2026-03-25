'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface DonutChartProps {
  data: Array<{ name: string; value: number }>
  height?: number
}

const COLORS = ['#4338ca', '#6366f1', '#a5b4fc', '#fbbf24']

export function DonutChart({ data, height = 140 }: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius="55%" outerRadius="80%" dataKey="value" paddingAngle={2}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, color: '#6b7280' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
