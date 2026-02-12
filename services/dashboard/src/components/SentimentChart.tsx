import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { SentimentStats } from '../types';

interface Props {
  stats: SentimentStats;
}

const COLORS = {
  positive: '#4caf50',
  negative: '#f44336',
  neutral: '#9e9e9e',
};

function SentimentChart({ stats }: Props) {
  const data = [
    { name: 'Positive', value: stats.sentiment_breakdown.positive },
    { name: 'Negative', value: stats.sentiment_breakdown.negative },
    { name: 'Neutral', value: stats.sentiment_breakdown.neutral },
  ].filter(item => item.value > 0); // Only show non-zero values

  if (data.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>No sentiment data available</div>;
  }

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell 
                key={`cell-${entry.name}`} 
                fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} 
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SentimentChart;