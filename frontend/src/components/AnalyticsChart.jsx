import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const AnalyticsChart = ({ data }) => {
  const formattedData = data.map((item) => ({
    date: item._id,
    clicks: item.count,
  }));

  return (
    <div className="rounded-3xl bg-white p-6 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Clicks Last 7 Days</h2>
          <p className="mt-1 text-sm text-slate-500">Trends for your short URLs.</p>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: 16, borderColor: '#e2e8f0' }}
              labelStyle={{ color: '#0f172a' }}
            />
            <Line
              type="monotone"
              dataKey="clicks"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 4, fill: '#2563eb' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsChart;
