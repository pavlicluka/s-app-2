import { useRef, useEffect, useState } from 'react'

interface RiskChartProps {
  title: string
  data: {
    labels: string[]
    values: number[]
    colors: string[]
  }
}

export default function RiskChartSimple({ title, data }: RiskChartProps) {
  console.log('🔍 RiskChartSimple: Component started with props:', { title, data })
  const [tooltip, setTooltip] = useState<{show: boolean, x: number, y: number, label: string, value: number, percentage: string} | null>(null)
  
  // Preverimo ali so podatki v pravilnem formatu
  if (!data || !data.labels || !data.values || !data.colors) {
    console.error('❌ RiskChartSimple: Invalid data format:', data)
    return (
      <div className="bg-bg-surface p-8 rounded-lg border border-border-subtle">
        <h3 className="text-heading-md font-semibold text-text-primary mb-6">{title}</h3>
        <div className="text-center text-text-secondary">Napaka pri prikazovanju grafov: neveljavni podatki</div>
      </div>
    )
  }

  console.log('✅ RiskChartSimple: Data format validation passed')

  // Pripravimo podatke
  const total = data.values.reduce((sum, value) => sum + value, 0)
  const chartData = data.labels.map((label, index) => ({
    label,
    value: data.values[index],
    percentage: total > 0 ? (data.values[index] / total * 100).toFixed(1) : '0',
    color: data.colors[index]
  }))

  console.log('📊 RiskChartSimple: Chart data prepared:', chartData)

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = rect.left + 140
    const y = rect.top + 50
    setTooltip({ show: true, x, y, label: '', value: 0, percentage: '0' })
  }

  const handleMouseLeave = () => {
    setTooltip(null)
  }

  return (
    <div className="bg-bg-surface p-8 rounded-lg border border-border-subtle">
      {/* Title */}
      <h3 className="text-heading-md font-semibold text-text-primary mb-6">{title}</h3>

      {/* Simple Pie Chart Representation */}
      <div className="w-[280px] h-[280px] mx-auto relative">
        <div className="absolute inset-0 rounded-full border-8 border-gray-800 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{total}</div>
            <div className="text-sm text-gray-300">Skupaj</div>
          </div>
        </div>
        
        {/* Simple colored segments */}
        <svg 
          className="w-full h-full rounded-full" 
          viewBox="0 0 100 100"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {chartData.map((segment, index) => {
            const angle = (segment.value / total) * 360
            const prevAngles = chartData.slice(0, index).reduce((sum, seg) => sum + (seg.value / total) * 360, 0)
            
            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke={segment.color}
                strokeWidth="8"
                strokeDasharray={`${angle} ${360 - angle}`}
                strokeDashoffset={-prevAngles}
                onMouseEnter={(e) => setTooltip({
                  show: true,
                  x: e.clientX,
                  y: e.clientY,
                  label: segment.label,
                  value: segment.value,
                  percentage: segment.percentage
                })}
                onMouseMove={(e) => setTooltip(prev => prev ? {
                  ...prev,
                  x: e.clientX,
                  y: e.clientY
                } : null)}
              />
            )
          })}
        </svg>

        {/* Custom Tooltip */}
        {tooltip && tooltip.show && (
          <div 
            className="absolute z-50 pointer-events-none"
            style={{ 
              left: '50%', 
              top: '-10px', 
              transform: 'translateX(-50%)',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              color: '#1f2937',
              fontSize: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              padding: '8px 12px'
            }}
          >
            <div style={{ color: '#374151', fontWeight: '600', marginBottom: '4px' }}>
              Tip: {tooltip.label}
            </div>
            <div>
              <span>{tooltip.value} ({tooltip.percentage}%)</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 space-y-3">
        {chartData.map((segment, index) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-body-sm text-gray-400">{segment.label}</span>
            <span className="text-body-sm font-medium text-gray-100 ml-auto">
              {segment.value} ({segment.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}