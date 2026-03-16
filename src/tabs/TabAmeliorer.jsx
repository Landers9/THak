import { useState, useEffect } from 'react'
import Plot from 'react-plotly.js'

export default function TabAmeliorer({ data }) {
  const risk = data.risk_scores
  const scatter = data.scatter_couv_urg
  const heatmap = data.heatmap_region
  const [geojson, setGeojson] = useState(null)
  const [carteMode, setCarteMode] = useState('couverture')

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson')
      .then(r => r.json())
      .then(setGeojson)
      .catch(() => {})
  }, [])

  const riskSorted = [...risk].sort((a, b) => b.score_risque - a.score_risque)
  const top15 = riskSorted.slice(0, 15)

  const critiques = risk.filter(d => d.profil === 'CRITIQUE').length
  const prioritaires = risk.filter(d => d.profil === 'PRIORITAIRE').length
  const corr = computeCorrelation(
    scatter.map(d => d.couv_65plus_moy),
    scatter.map(d => d.taux_urg_moyen)
  )

  return (
    <div>
      <h2 className="section-title">Ameliorer l'acces aux soins dans les zones sous-vaccinees</h2>
      <p className="section-desc">
        L'objectif final est d'identifier les departements ou la couverture vaccinale est insuffisante
        et ou les urgences sont fortement sollicitees. En combinant ces deux indicateurs dans un
        "score de risque", on peut classer les departements par priorite d'intervention et proposer
        des strategies ciblees adaptees a chaque profil de territoire.
      </p>

      <div className="kpi-row">
        <div className="kpi-card kpi-red">
          <div className="kpi-label">Departements critiques</div>
          <div className="kpi-value">{critiques}</div>
        </div>
        <div className="kpi-card kpi-orange">
          <div className="kpi-label">Departements prioritaires</div>
          <div className="kpi-value">{prioritaires}</div>
        </div>
        <div className="kpi-card kpi-blue">
          <div className="kpi-label">Correlation couv./urgences</div>
          <div className="kpi-value">{corr.toFixed(3)}</div>
        </div>
        <div className="kpi-card kpi-purple">
          <div className="kpi-label">Departements analyses</div>
          <div className="kpi-value">{risk.length}</div>
        </div>
      </div>

      <div className="explanation">
        <h4>Le score de risque : comment est-il calcule ?</h4>
        <p>
          Le score combine deux composantes normalisees entre 0 et 1 : (1) le deficit de couverture
          vaccinale 65+ par rapport au departement le mieux vaccine, et (2) le taux moyen de passages
          aux urgences pour grippe. La moyenne des deux donne un score entre 0 (faible risque) et 1
          (risque maximal). Les departements sont ensuite classes en 4 profils : CRITIQUE (sous-vaccine
          + fortes urgences), PRIORITAIRE (sous-vaccine), ATTENTION (fortes urgences) et SURVEILLANCE (modere).
        </p>
      </div>

      {geojson && (
        <div className="chart-grid single">
          <div className="chart-card">
            <h3>Carte de France par departement</h3>
            <p className="chart-desc">
              Visualisation geographique permettant d'identifier en un coup d'oeil les zones
              problematiques. Basculez entre couverture vaccinale et score de risque.
            </p>
            <div className="selector">
              <label>
                <input type="radio" value="couverture" checked={carteMode === 'couverture'}
                       onChange={() => setCarteMode('couverture')} /> Couverture vaccinale 65+
              </label>
              <label style={{ marginLeft: 16 }}>
                <input type="radio" value="risque" checked={carteMode === 'risque'}
                       onChange={() => setCarteMode('risque')} /> Score de risque
              </label>
            </div>
            <Plot
              data={[{
                type: 'choropleth',
                geojson: geojson,
                locations: carteMode === 'couverture'
                  ? data.couverture_dept_derniere.map(d => d.dep)
                  : risk.map(d => d.dep),
                z: carteMode === 'couverture'
                  ? data.couverture_dept_derniere.map(d => d.grip_65plus)
                  : risk.map(d => d.score_risque),
                featureidkey: 'properties.code',
                colorscale: carteMode === 'couverture' ? 'RdYlGn' : 'OrRd',
                reversescale: carteMode === 'couverture',
                colorbar: {
                  title: carteMode === 'couverture' ? 'Couverture (%)' : 'Score risque'
                },
                text: carteMode === 'couverture'
                  ? data.couverture_dept_derniere.map(d => `${d.dep} - ${d.libgeo || ''}`)
                  : risk.map(d => `${d.dep} - ${d.libgeo || ''}`),
                hovertemplate: '%{text}<br>%{z:.1f}<extra></extra>'
              }]}
              layout={{
                geo: {
                  fitbounds: 'locations', visible: false,
                  scope: 'europe',
                  projection: { type: 'mercator' }
                },
                template: 'plotly_white', height: 550,
                margin: { t: 10, b: 10, l: 10, r: 10 }
              }}
              config={{ responsive: true }}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      )}

      <div className="explanation">
        <h4>Correlation entre couverture vaccinale et urgences</h4>
        <p>
          Le nuage de points ci-dessous montre la relation entre couverture vaccinale 65+ (axe X)
          et taux moyen de passages urgences grippe (axe Y) pour chaque departement. Une correlation
          negative (r = {corr.toFixed(3)}) signifie que les departements les moins vaccines sont aussi
          ceux qui sollicitent le plus les urgences. C'est la preuve directe que vacciner davantage
          reduit la pression hospitaliere.
        </p>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Top 15 departements a risque</h3>
          <p className="chart-desc">
            Classes par score de risque decroissant. La couleur indique le profil de risque.
          </p>
          <Plot
            data={[
              ...['CRITIQUE', 'PRIORITAIRE', 'ATTENTION', 'SURVEILLANCE'].map(profil => {
                const filtered = top15.filter(d => d.profil === profil).sort((a, b) => a.score_risque - b.score_risque)
                const colors = { CRITIQUE: '#EF553B', PRIORITAIRE: '#FFA15A', ATTENTION: '#FECB52', SURVEILLANCE: '#636EFA' }
                return {
                  x: filtered.map(d => d.score_risque),
                  y: filtered.map(d => d.libgeo || d.dep),
                  type: 'bar', orientation: 'h', name: profil,
                  marker: { color: colors[profil] }
                }
              })
            ]}
            layout={{
              template: 'plotly_white', height: 500, barmode: 'stack',
              xaxis: { title: 'Score de risque' },
              margin: { l: 150, t: 10 }
            }}
            config={{ responsive: true }}
            style={{ width: '100%' }}
          />
        </div>

        <div className="chart-card">
          <h3>Couverture vaccinale vs Urgences par departement</h3>
          <p className="chart-desc">
            Chaque point = un departement. La droite de regression confirme la correlation negative.
          </p>
          <Plot
            data={[{
              x: scatter.map(d => d.couv_65plus_moy),
              y: scatter.map(d => d.taux_urg_moyen),
              mode: 'markers', type: 'scatter',
              text: scatter.map(d => `${d.dep} - ${d.libgeo || ''}`),
              hovertemplate: '%{text}<br>Couv: %{x:.1f}%<br>Urg: %{y:.0f}/100k<extra></extra>',
              marker: { color: '#636EFA', size: 8, opacity: 0.7 }
            }]}
            layout={{
              template: 'plotly_white', height: 500,
              xaxis: { title: 'Couverture vaccinale 65+ moyenne (%)' },
              yaxis: { title: 'Taux moyen passages urgences grippe' },
              margin: { t: 10 }
            }}
            config={{ responsive: true }}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div className="explanation">
        <h4>Heatmap regionale : evolution dans le temps</h4>
        <p>
          Cette carte thermique montre l'evolution de la couverture vaccinale 65+ par region
          et par annee. Les zones rouges/orange signalent les regions et periodes ou la couverture
          est la plus faible. Elle permet d'identifier si certaines regions s'ameliorent ou au
          contraire se degradent au fil du temps.
        </p>
      </div>

      <div className="chart-grid single">
        <div className="chart-card">
          <h3>Heatmap : couverture vaccinale 65+ par region et annee</h3>
          <p className="chart-desc">
            Source : Sante publique France — Couvertures vaccinales regionales.
          </p>
          <Plot
            data={[{
              z: heatmap.values,
              x: heatmap.years,
              y: heatmap.regions,
              type: 'heatmap',
              colorscale: 'RdYlGn',
              colorbar: { title: 'Couv. (%)' }
            }]}
            layout={{
              template: 'plotly_white', height: 450,
              margin: { l: 200, t: 10 }
            }}
            config={{ responsive: true }}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Tableau des departements prioritaires */}
      <h3 style={{ marginTop: 30, marginBottom: 16 }}>Plan d'action : departements prioritaires</h3>
      <div className="chart-card" style={{ overflowX: 'auto' }}>
        <table className="risk-table">
          <thead>
            <tr>
              <th>Code</th><th>Departement</th><th>Region</th><th>Profil</th>
              <th>Score</th><th>Couv. 65+ (%)</th><th>Ecart OMS (pts)</th>
              <th>Taux urg.</th><th>Taux hospit.</th>
            </tr>
          </thead>
          <tbody>
            {top15.map(d => (
              <tr key={d.dep}>
                <td>{d.dep}</td>
                <td><strong>{d.libgeo}</strong></td>
                <td>{d.reglib}</td>
                <td><span className={`badge ${d.profil}`}>{d.profil}</span></td>
                <td>{d.score_risque}</td>
                <td>{d.couv_65plus_moy}</td>
                <td>{d.ecart_oms}</td>
                <td>{d.taux_urg_moyen}</td>
                <td>{d.taux_hospit_moyen}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Strategies */}
      <h3 style={{ marginTop: 30, marginBottom: 8 }}>Strategies recommandees par profil</h3>
      <div className="strategy-grid">
        <div className="strategy-card" style={{ borderLeft: '4px solid #EF553B' }}>
          <h4><span className="badge CRITIQUE">CRITIQUE</span> Sous-vaccine + fortes urgences</h4>
          <ul>
            <li>Campagnes de sensibilisation intensives (medias locaux, affichage, SMS cibles)</li>
            <li>Bus vaccinaux mobiles en zones rurales et quartiers prioritaires</li>
            <li>Renforcement des equipes aux urgences en periode de pic</li>
          </ul>
        </div>
        <div className="strategy-card" style={{ borderLeft: '4px solid #FFA15A' }}>
          <h4><span className="badge PRIORITAIRE">PRIORITAIRE</span> Couverture insuffisante</h4>
          <ul>
            <li>Relance ciblee 65+ via medecins traitants et pharmacies</li>
            <li>Rappels personnalises par courrier Assurance Maladie</li>
            <li>Elargir les plages de vaccination sans rendez-vous en pharmacie</li>
          </ul>
        </div>
        <div className="strategy-card" style={{ borderLeft: '4px solid #FECB52' }}>
          <h4><span className="badge ATTENTION">ATTENTION</span> Forte pression aux urgences</h4>
          <ul>
            <li>Pre-positionner du personnel soignant supplementaire</li>
            <li>Renforcer SOS Medecins en periode de pic grippal</li>
            <li>Ameliorer le suivi epidemiologique en temps reel</li>
          </ul>
        </div>
        <div className="strategy-card" style={{ borderLeft: '4px solid #2e7d32' }}>
          <h4><span className="badge SURVEILLANCE">SURVEILLANCE</span> Risque modere</h4>
          <ul>
            <li>Maintenir la surveillance existante</li>
            <li>Encourager la vaccination de routine</li>
            <li>Partager les bonnes pratiques avec les departements voisins</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function computeCorrelation(x, y) {
  const n = Math.min(x.length, y.length)
  if (n === 0) return 0
  const mx = x.reduce((a, b) => a + b, 0) / n
  const my = y.reduce((a, b) => a + b, 0) / n
  let num = 0, dx = 0, dy = 0
  for (let i = 0; i < n; i++) {
    const xi = x[i] - mx, yi = y[i] - my
    num += xi * yi
    dx += xi * xi
    dy += yi * yi
  }
  return dx && dy ? num / Math.sqrt(dx * dy) : 0
}
