import { PieChart, Pie, Cell } from 'recharts';
import type { SentimentStats } from '../services/api';

interface Props {
  stats: SentimentStats;
}

const SIZE = 128;

const COLORS = {
  positive: '#22c55e',
  neutral: '#6b7280',
  negative: '#ef4444',
};

export default function SentimentChart({ stats }: Props) {
  const data = [
    { name: 'Positive', value: stats.sentiment_breakdown.positive },
    { name: 'Neutral', value: stats.sentiment_breakdown.neutral },
    { name: 'Negative', value: stats.sentiment_breakdown.negative },
  ].filter(item => item.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm w-32 h-32">
        No data
      </div>
    );
  }

  return (
    <PieChart width={SIZE} height={SIZE}>
      <Pie
        data={data}
        cx={SIZE / 2}
        cy={SIZE / 2}
        innerRadius={24}
        outerRadius={48}
        paddingAngle={2}
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]}
          />
        ))}
      </Pie>
    </PieChart>
  );
}