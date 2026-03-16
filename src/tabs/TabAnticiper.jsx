import { useState } from 'react'
import Plot from 'react-plotly.js'

export default function TabAnticiper({ data }) {
  const urgTs = data.urgences_france_ts
  const urgAge = data.urgences_france_age
  const ageGroups = [...new Set(urgAge.map(d => d.sursaud_cl_age_gene))]
  const [selectedAges, setSelectedAges] = useState(ageGroups)

  const toggleAge = (age) => {
    setSelectedAges(prev =>
      prev.includes(age) ? prev.filter(a => a !== age) : [...prev, age]
    )
  }

  const lastUrg = urgTs[urgTs.length - 1]
  const maxUrg = Math.max(...urgTs.map(d => d.taux_passages_grippe_sau || 0))

  return (
    <div>
      <h2 className="section-title">Anticiper les flux aux urgences et SOS Medecins</h2>
      <p className="section-desc">
        Chaque hiver, les epidemies de grippe provoquent des pics de passages aux urgences et
        d'appels SOS Medecins. En analysant les series temporelles historiques (depuis 2020),
        on identifie la saisonnalite et l'amplitude des pics pour aider les etablissements de sante
        a pre-positionner leurs ressources (personnel, lits, materiel).
      </p>

      <div className="kpi-row">
        <div className="kpi-card kpi-red">
          <div className="kpi-label">Pic max urgences grippe</div>
          <div className="kpi-value">{maxUrg.toFixed(0)}/100k</div>
        </div>
        <div className="kpi-card kpi-blue">
          <div className="kpi-label">Dernier taux urgences</div>
          <div className="kpi-value">{(lastUrg?.taux_passages_grippe_sau || 0).toFixed(0)}/100k</div>
        </div>
        <div className="kpi-card kpi-orange">
          <div className="kpi-label">Dernier taux SOS</div>
          <div className="kpi-value">{(lastUrg?.taux_actes_grippe_sos || 0).toFixed(0)}/100k</div>
        </div>
        <div className="kpi-card kpi-green">
          <div className="kpi-label">Donnees depuis</div>
          <div className="kpi-value">2020</div>
        </div>
      </div>

      <div className="explanation">
        <h4>Saisonnalite de la grippe</h4>
        <p>
          La grippe suit un cycle annuel previsible : les pics surviennent entre les semaines 2 et 8
          de chaque annee (janvier-fevrier). Cette regularite permet d'anticiper les periodes de forte
          pression hospitaliere. Le graphique ci-dessous montre les deux indicateurs cle en parallele :
          les passages aux urgences (pression immediate) et les actes SOS Medecins (medecine de ville).
          Quand les deux montent simultanement, c'est le signal d'une epidemie intense.
        </p>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Passages aux urgences grippe (France)</h3>
          <p className="chart-desc">
            Taux pour 100 000 passages, tous ages confondus. Les pics hivernaux sont clairement visibles.
            Source : Sante publique France — reseau OSCOUR / SurSaUD.
          </p>
          <Plot
            data={[{
              x: urgTs.map(d => d.date_complet),
              y: urgTs.map(d => d.taux_passages_grippe_sau),
              mode: 'lines', name: 'Urgences grippe',
              line: { color: '#EF553B', width: 2 },
              fill: 'tozeroy', fillcolor: 'rgba(239,85,59,0.1)'
            }]}
            layout={{
              template: 'plotly_white', height: 380,
              yaxis: { title: 'Taux / 100k passages' },
              margin: { t: 10 }
            }}
            config={{ responsive: true }}
            style={{ width: '100%' }}
          />
        </div>

        <div className="chart-card">
          <h3>Actes SOS Medecins grippe (France)</h3>
          <p className="chart-desc">
            Taux pour 100 000 actes SOS Medecins. Cet indicateur capte la pression en medecine
            de ville, complementaire aux urgences hospitalieres.
          </p>
          <Plot
            data={[{
              x: urgTs.map(d => d.date_complet),
              y: urgTs.map(d => d.taux_actes_grippe_sos),
              mode: 'lines', name: 'SOS Medecins grippe',
              line: { color: '#636EFA', width: 2 },
              fill: 'tozeroy', fillcolor: 'rgba(99,110,250,0.1)'
            }]}
            layout={{
              template: 'plotly_white', height: 380,
              yaxis: { title: 'Taux / 100k actes' },
              margin: { t: 10 }
            }}
            config={{ responsive: true }}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div className="explanation">
        <h4>Pourquoi ventiler par tranche d'age ?</h4>
        <p>
          La grippe ne touche pas toutes les tranches d'age de la meme facon. Les 0-4 ans
          et les 65+ sont les plus representes aux urgences. Identifier quel groupe d'age
          genere le plus de passages permet de cibler les campagnes de prevention et d'adapter
          les ressources pediatriques vs geriatriques dans les hopitaux en periode de pic.
        </p>
      </div>

      <div className="selector">
        <label>Tranches d'age :</label>
        {ageGroups.map(age => (
          <label key={age} style={{ marginRight: 12, fontSize: '0.85rem' }}>
            <input type="checkbox" checked={selectedAges.includes(age)}
                   onChange={() => toggleAge(age)} style={{ marginRight: 4 }} />
            {age}
          </label>
        ))}
      </div>

      <div className="chart-grid single">
        <div className="chart-card">
          <h3>Passages urgences grippe par tranche d'age</h3>
          <p className="chart-desc">
            Chaque courbe represente une tranche d'age. Les 0-4 ans montrent des pics
            tres eleves, confirmant la vulnerabilite des jeunes enfants face a la grippe.
          </p>
          <Plot
            data={selectedAges.map(age => {
              const filtered = urgAge.filter(d => d.sursaud_cl_age_gene === age)
              return {
                x: filtered.map(d => d.date_complet),
                y: filtered.map(d => d.taux_passages_grippe_sau),
                mode: 'lines', name: age,
                line: { width: 2 }
              }
            })}
            layout={{
              template: 'plotly_white', height: 420,
              yaxis: { title: 'Taux / 100k passages' },
              margin: { t: 10 }
            }}
            config={{ responsive: true }}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  )
}
