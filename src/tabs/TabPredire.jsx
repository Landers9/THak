import Plot from 'react-plotly.js'

export default function TabPredire({ data }) {
  const cvFr = data.couverture_france
  const lastRow = cvFr[cvFr.length - 1]
  const couv65 = lastRow?.grip_65plus || 0
  const ecartOMS = (75 - couv65).toFixed(1)

  return (
    <div>
      <h2 className="section-title">Predire les besoins en vaccins</h2>
      <p className="section-desc">
        L'objectif est d'anticiper les besoins en vaccins grippe pour les prochaines saisons.
        En analysant l'evolution historique de la couverture vaccinale et les tendances de distribution
        des doses en pharmacie, on peut estimer les volumes necessaires et identifier les ecarts
        par rapport a l'objectif OMS de 75% chez les 65+.
      </p>

      <div className="kpi-row">
        <div className="kpi-card kpi-blue">
          <div className="kpi-label">Couverture 65+ nationale</div>
          <div className="kpi-value">{couv65.toFixed(1)}%</div>
        </div>
        <div className="kpi-card kpi-red">
          <div className="kpi-label">Ecart objectif OMS (75%)</div>
          <div className="kpi-value">-{ecartOMS} pts</div>
        </div>
        <div className="kpi-card kpi-green">
          <div className="kpi-label">Tendance</div>
          <div className="kpi-value">Stagnation</div>
        </div>
        <div className="kpi-card kpi-orange">
          <div className="kpi-label">Saisons analysees</div>
          <div className="kpi-value">5</div>
        </div>
      </div>

      <div className="explanation">
        <h4>Pourquoi ce graphique ?</h4>
        <p>
          La couverture vaccinale grippe chez les 65+ stagne autour de 50-55% depuis 2011,
          bien en dessous de l'objectif OMS de 75%. Cette tendance montre que les campagnes actuelles
          ne suffisent pas a atteindre la cible. Chez les moins de 65 ans, la couverture reste
          extremement faible ({"<"}30%), ce qui laisse une large part de la population vulnerable.
          Comprendre cette evolution est le point de depart pour predire les volumes de vaccins
          necessaires si l'on veut combler cet ecart.
        </p>
      </div>

      <div className="chart-grid single">
        <div className="chart-card">
          <h3>Evolution de la couverture vaccinale grippe en France</h3>
          <p className="chart-desc">
            Source : Sante publique France (ODISSE) — Couvertures vaccinales nationales, 2011-2024.
            La ligne rouge pointillee indique l'objectif OMS de 75% pour les 65 ans et plus.
          </p>
          <Plot
            data={[
              {
                x: cvFr.map(d => d.an_mesure),
                y: cvFr.map(d => d.grip_65plus),
                mode: 'lines+markers', name: '65 ans et plus',
                line: { color: '#636EFA', width: 3 },
                marker: { size: 8 }
              },
              {
                x: cvFr.map(d => d.an_mesure),
                y: cvFr.map(d => d.grip_moins65),
                mode: 'lines+markers', name: 'Moins de 65 ans',
                line: { color: '#EF553B', width: 3 },
                marker: { size: 8 }
              }
            ]}
            layout={{
              template: 'plotly_white', height: 420,
              xaxis: { title: 'Annee' },
              yaxis: { title: 'Couverture vaccinale (%)', range: [0, 80] },
              shapes: [{
                type: 'line', x0: cvFr[0]?.an_mesure, x1: lastRow?.an_mesure,
                y0: 75, y1: 75, line: { color: 'red', width: 2, dash: 'dash' }
              }],
              annotations: [{
                x: lastRow?.an_mesure, y: 76, text: 'Objectif OMS 75%',
                showarrow: false, font: { color: 'red', size: 12 }
              }],
              margin: { t: 20 }
            }}
            config={{ responsive: true }}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div className="explanation">
        <h4>Pourquoi ce graphique ?</h4>
        <p>
          En croisant les doses distribuees par IQVIA avec les actes de vaccination realises,
          on mesure le "taux d'utilisation" des vaccins. L'ecart entre les deux revele le gaspillage :
          des doses commandees mais jamais injectees. Ce graphique permet de quantifier ce phenomene
          saison apres saison et d'ajuster les commandes futures en consequence.
        </p>
      </div>

      <div className="chart-grid single">
        <div className="chart-card">
          <h3>Doses distribuees vs Actes de vaccination par saison</h3>
          <p className="chart-desc">
            Source : IQVIA (data.gouv.fr) — Suivi quotidien de la campagne de vaccination grippe
            en pharmacie. Doses = vaccins livres aux pharmacies. Actes = vaccinations effectivement realisees.
          </p>
          <Plot
            data={[
              {
                x: data.iqvia_saison.map(d => d.saison),
                y: data.iqvia_saison.map(d => d.doses),
                type: 'bar', name: 'Doses distribuees',
                marker: { color: '#636EFA' }
              },
              {
                x: data.iqvia_saison.map(d => d.saison),
                y: data.iqvia_saison.map(d => d.actes),
                type: 'bar', name: 'Actes vaccination',
                marker: { color: '#00CC96' }
              }
            ]}
            layout={{
              barmode: 'group', template: 'plotly_white', height: 400,
              yaxis: { title: 'Nombre' },
              margin: { t: 20 }
            }}
            config={{ responsive: true }}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  )
}
