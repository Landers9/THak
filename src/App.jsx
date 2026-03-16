import { useState, useEffect } from 'react'
import './App.css'
import TabPredire from './tabs/TabPredire'
import TabOptimiser from './tabs/TabOptimiser'
import TabAnticiper from './tabs/TabAnticiper'
import TabAmeliorer from './tabs/TabAmeliorer'

const TABS = [
  { id: 'predire', label: 'Predire', icon: '📊' },
  { id: 'optimiser', label: 'Optimiser', icon: '💊' },
  { id: 'anticiper', label: 'Anticiper', icon: '🏥' },
  { id: 'ameliorer', label: 'Ameliorer', icon: '🗺️' },
]

function App() {
  const [activeTab, setActiveTab] = useState('predire')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const files = [
      'couverture_france', 'couverture_dept_derniere', 'heatmap_region',
      'urgences_france_ts', 'urgences_france_age',
      'risk_scores', 'scatter_couv_urg',
      'iqvia_saison', 'iqvia_region', 'iqvia_campagne_kpi'
    ]
    Promise.all(files.map(f => fetch(`/data/${f}.json`).then(r => r.json())))
      .then(results => {
        const d = {}
        files.forEach((f, i) => d[f] = results[i])
        setData(d)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="loading">Chargement des donnees...</div>

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>VacciGrip</h1>
          <div className="subtitle">Optimisation de la strategie vaccinale grippe — Hackathon Epitech</div>
        </div>
      </header>

      <nav className="tabs">
        {TABS.map(t => (
          <div key={t.id}
               className={`tab ${activeTab === t.id ? 'active' : ''}`}
               onClick={() => setActiveTab(t.id)}>
            <span className="tab-icon">{t.icon}</span> {t.label}
          </div>
        ))}
      </nav>

      <main className="content">
        {activeTab === 'predire' && <TabPredire data={data} />}
        {activeTab === 'optimiser' && <TabOptimiser data={data} />}
        {activeTab === 'anticiper' && <TabAnticiper data={data} />}
        {activeTab === 'ameliorer' && <TabAmeliorer data={data} />}
      </main>
    </div>
  )
}

export default App
