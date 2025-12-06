import React from 'react'

interface RiskChartProps {
  title: string
  data: {
    labels: string[]
    values: number[]
    colors: string[]
  }
}

export default function RiskChartStatic({ title, data }: RiskChartProps) {
  // Vsa sporočila bomo logiramo le za debug
  console.log('🔍 RiskChartStatic: Component started with props:', { title, data })
  
  // Preverimo ali so podatki v pravilnem formatu
  if (!data || !data.labels || !data.values || !data.colors) {
    console.error('❌ RiskChartStatic: Invalid data format:', data)
    return React.createElement('div', {
      className: "bg-bg-surface p-8 rounded-lg border border-border-subtle"
    }, [
      React.createElement('h3', {
        key: 'title',
        className: "text-heading-md font-semibold text-text-primary mb-6"
      }, title),
      React.createElement('div', {
        key: 'error',
        className: "text-center text-text-secondary"
      }, 'Napaka pri prikazovanju grafov: neveljavni podatki')
    ])
  }

  console.log('✅ RiskChartStatic: Data format validation passed')

  // Pripravimo podatke
  const total = data.values.reduce((sum, value) => sum + value, 0)
  const chartData = data.labels.map((label, index) => ({
    label,
    value: data.values[index],
    percentage: total > 0 ? (data.values[index] / total * 100).toFixed(1) : '0',
    color: data.colors[index]
  }))

  console.log('📊 RiskChartStatic: Chart data prepared:', chartData)

  // Statistike
  const chartElements = chartData.map((segment, index) => 
    React.createElement('div', {
      key: index,
      className: "flex items-center gap-3"
    }, [
      React.createElement('div', {
        key: 'color',
        className: "w-3 h-3 rounded-full",
        style: { backgroundColor: segment.color }
      }),
      React.createElement('span', {
        key: 'label',
        className: "text-body-sm text-text-secondary"
      }, segment.label),
      React.createElement('span', {
        key: 'value',
        className: "text-body-sm font-medium text-text-primary ml-auto"
      }, `${segment.value} (${segment.percentage}%)`)
    ])
  )

  // Statistični podatki
  const statsElements = data.values.map((value, index) =>
    React.createElement('div', {
      key: `stat-${index}`,
      className: "bg-gray-800 rounded-lg p-4 text-center"
    }, [
      React.createElement('div', {
        key: 'value',
        className: "text-2xl font-bold text-white"
      }, value.toString()),
      React.createElement('div', {
        key: 'label',
        className: "text-sm text-gray-400"
      }, data.labels[index])
    ])
  )

  return React.createElement('div', {
    className: "bg-bg-surface p-8 rounded-lg border border-border-subtle"
  }, [
    // Title
    React.createElement('h3', {
      key: 'title',
      className: "text-heading-md font-semibold text-text-primary mb-6"
    }, title),

    // Statistike - preprosto prikazovanje
    React.createElement('div', {
      key: 'stats',
      className: "grid grid-cols-2 gap-4 mb-6"
    }, statsElements),

    // Total
    React.createElement('div', {
      key: 'total',
      className: "text-center mb-4 p-4 bg-gray-800 rounded-lg"
    }, [
      React.createElement('div', {
        key: 'total-value',
        className: "text-xl font-bold text-white"
      }, `Skupaj: ${total}`),
      React.createElement('div', {
        key: 'total-label',
        className: "text-sm text-gray-400"
      }, 'Vsi elementi')
    ]),

    // Legend
    React.createElement('div', {
      key: 'legend',
      className: "mt-6 space-y-3"
    }, chartElements)
  ])
}