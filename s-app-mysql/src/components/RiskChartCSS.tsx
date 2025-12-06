import React from 'react'

interface RiskChartCSSProps {
  title: string
  data: {
    labels: string[]
    values: number[]
    colors: string[]
  }
}

const RiskChartCSS: React.FC<RiskChartCSSProps> = ({ title, data }) => {
  console.log(`📊 RiskChartCSS: Prejemam podatke za "${title}"`, data)
  
  const total = data.values.reduce((sum, value) => sum + value, 0)
  
  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
      
      {total === 0 ? (
        <div className="text-gray-500 text-center py-4">
          Ni podatkov za prikaz
        </div>
      ) : (
        <div className="space-y-3">
          {data.labels.map((label, index) => {
            const value = data.values[index]
            const percentage = total > 0 ? (value / total) * 100 : 0
            const color = data.colors[index]
            
            return (
              <div key={index} className="flex items-center">
                <div 
                  className="w-4 h-4 rounded mr-3 flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {label}
                  </span>
                  <span className="text-sm text-gray-600">
                    {value} ({percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            )
          })}
          
          {/* Vizualni stolpci */}
          <div className="mt-4 pt-3 border-t">
            <div className="flex h-20 rounded overflow-hidden">
              {data.labels.map((_, index) => {
                const value = data.values[index]
                const width = total > 0 ? (value / total) * 100 : 0
                const color = data.colors[index]
                
                return (
                  <div
                    key={index}
                    className="flex items-center justify-center text-white text-xs font-medium"
                    style={{ 
                      backgroundColor: color, 
                      width: `${width}%`,
                      minWidth: width > 0 ? '8px' : '0px'
                    }}
                    title={`${data.labels[index]}: ${value} (${percentage}%)`}
                  >
                    {width > 10 && `${Math.round(width)}%`}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RiskChartCSS