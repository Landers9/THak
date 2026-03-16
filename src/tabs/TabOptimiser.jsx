import { useState } from 'react'
import Plot from 'react-plotly.js'

export default function TabOptimiser({ data }) {
  const kpi = data.iqvia_campagne_kpi
  const saisons = [...new Set(data.iqvia_region.map(d => d.saison))].sort().reverse()
  const [saison, setSaison] = useState(saisons[0])

  const regData = data.iqvia_region
    .filter(d => d.saison === saison)
    .sort((a, b) => a.taux_utilisation - b.taux_utilisation)

  const dosesTotal = kpi['DOSES(J07E1)'] || 0
  const actesTotal = kpi['ACTE(VGP)'] || 0
  const tauxUtil = dosesTotal > 0 ? (actesTotal / dosesTotal * 100).toFixed(1) : 0
  const pharma = kpi['POURCENTAGE'] || 0

  return (
    <div>
      <h2 className="section-title">Optimiser la distribution des vaccins</h2>
      <p className="section-desc">
        Chaque saison, des millions de doses de vaccins grippe sont livrees aux pharmacies par IQVIA.
        Mais toutes ne sont pas utilisees : l'ecart entre doses distribuees et actes de vaccination
        revele un gaspillage significatif. L'objectif ici est d'identifier les regions ou cet ecart
        est le plus important pour redistribuer les doses excedentaires vers les zones qui en ont besoin.
      </p>

      <div className="kpi-row">
        <div className="kpi-card kpi-blue">
          <div className="kpi-label">Doses distribuees ({kpi.saison})</div>
          <div className="kpi-value">{(dosesTotal / 1e6).toFixed(1)}M</div>
        </div>
        <div className="kpi-card kpi-green">
          <div className="kpi-label">Actes vaccination</div>
          <div className="kpi-value">{(actesTotal / 1e6).toFixed(1)}M</div>
        </div>
        <div className="kpi-card kpi-orange">
          <div className="kpi-label">Taux d'utilisation</div>
          <div className="kpi-value">{tauxUtil}%</div>
        </div>
        <div className="kpi-card kpi-purple">
          <div className="kpi-label">Pharmacies participantes</div>
          <div className="kpi-value">{pharma}%</div>
        </div>
      </div>

      <div className="explanation">
        <h4>Pourquoi analyser le taux d'utilisation par region ?</h4>
        <p>
          Le taux d'utilisation (actes / doses x 100) varie fortement d'une region a l'autre.
          Une region avec un taux faible recoit trop de doses par rapport a sa capacite de vaccination :
          c'est du gaspillage. A l'inverse, une region a taux eleve pourrait en absorber davantage.
          Ce desequilibre permet d'orienter la redistribution logistique pour la saison suivante.
        </p>
      </div>

      <div className="selector">
        <label>Saison :</label>
        <select value={saison} onChange={e => setSaison(e.target.value)}>
          {saisons.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Taux d'utilisation par region ({saison})</h3>
          <p className="chart-desc">
            Chaque barre represente le ratio actes/doses pour une region.
            Plus la barre est courte, plus le gaspillage est eleve.
          </p>
          <Plot
            data={[{
              x: regData.map(d => d.taux_utilisation),
              y: regData.map(d => d.region),
              type: 'bar', orientation: 'h',
              marker: {
                color: regData.map(d => d.taux_utilisation),
                colorscale: 'RdYlGn', cmin: 50, cmax: 80
              }
            }]}
            layout={{
              template: 'plotly_white', height: 450,
              xaxis: { title: 'Taux d\'utilisation (%)' },
              margin: { l: 200, t: 10 }
            }}
            config={{ responsive: true }}
            style={{ width: '100%' }}
          />
        </div>

        <div className="chart-card">
          <h3>Doses non utilisees par region ({saison})</h3>
          <p className="chart-desc">
            Volume de doses excedentaires (distribuees - injectees).
            Les regions en rouge ont le plus grand ecart a combler.
          </p>
          <Plot
            data={[{
              x: regData.map(d => d.region),
              y: regData.map(d => d.ecart),
              type: 'bar',
              marker: {
                color: regData.map(d => d.ecart > 0 ? '#EF553B' : '#00CC96')
              }
            }]}
            layout={{
              template: 'plotly_white', height: 450,
              yaxis: { title: 'Doses excedentaires' },
              xaxis: { tickangle: -45 },
              margin: { b: 120, t: 10 }
            }}
            config={{ responsive: true }}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div className="explanation">
        <h4>Ce que cela implique pour les decideurs</h4>
        <p>
          Les regions a faible taux d'utilisation devraient recevoir moins de doses la saison suivante,
          tandis que les regions a fort taux pourraient en absorber plus. Ce mecanisme de redistribution
          permettrait de reduire le gaspillage tout en ameliorant l'acces au vaccin la ou la demande est reelle.
          Par ailleurs, les 7% de pharmacies non participantes representent un levier d'action supplementaire
          pour elargir la couverture geographique.
        </p>
      </div>
    </div>
  )
}
