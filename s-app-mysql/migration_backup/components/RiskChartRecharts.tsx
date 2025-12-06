import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface RiskChartProps {
  title: string
  data: {
    labels: string[]
    values: number[]
    colors: string[]
  }
}

export default function RiskChartRecharts({ title, data }: RiskChartProps) {
  console.log('🔍 RiskChartRecharts: Component started with props:', { title, data })
  
  // Preverimo ali so podatki v pravilnem formatu
  if (!data || !data.labels || !data.values || !data.colors) {
    console.error('❌ RiskChartRecharts: Invalid data format:', data)
    return (
      <div className="bg-bg-surface p-8 rounded-lg border border-border-subtle">
        <h3 className="text-heading-md font-semibold text-text-primary mb-6">{title}</h3>
        <div className="text-center text-text-secondary">Napaka pri prikazovanju grafov: neveljavni podatki</div>
      </div>
    )
  }

  console.log('✅ RiskChartRecharts: Data format validation passed')

  // Pretvorimo podatke v format ki ga pričakuje Recharts
  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.values[index],
    fill: data.colors[index]
  }))

  console.log('📊 RiskChartRecharts: Chart data prepared:', chartData)

  return (
    <div className="bg-bg-surface p-8 rounded-lg border border-border-subtle">
      {/* Title */}
      <h3 className="text-heading-md font-semibold text-text-primary mb-6">{title}</h3>

      {/* Chart */}
      <div className="w-[280px] h-[280px] mx-auto">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              dataKey="value"
              startAngle={90}
              endAngle={450}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name) => [`${value}`, name]}
              labelFormatter={(label) => `Tip: ${label}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                color: '#1f2937',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              labelStyle={{ color: '#374151', fontWeight: '600' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-6 space-y-3">
        {data.labels.map((label, index) => {
          const totalValue = data.values.reduce((sum, val) => sum + val, 0)
          const percentage = totalValue > 0 ? ((data.values[index] / totalValue) * 100).toFixed(1) : '0'
          
          return (
            <div key={index} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: data.colors[index] }}
              />
              <span className="text-body-sm text-text-secondary">{label}</span>
              <span className="text-body-sm font-medium text-text-primary ml-auto">
                {data.values[index]} ({percentage}%)
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}