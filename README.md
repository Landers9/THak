# GrippeVax — Dashboard d'aide a la decision vaccinale grippe

Dashboard interactif pour optimiser la strategie de vaccination contre la grippe en France, developpe dans le cadre du hackathon Epitech T-HAK.

## Problematique

La France n'atteint pas l'objectif OMS de 75% de couverture vaccinale grippe chez les 65+. La couverture stagne autour de 50% depuis 2011, et chaque hiver les urgences sont debordees par des patients grippaux. En parallele, des millions de doses livrees en pharmacie ne sont jamais utilisees.

## Ce que fait le dashboard

Le dashboard repond a 4 questions strategiques a travers 4 onglets :

### Predire les besoins
- Evolution de la couverture vaccinale nationale depuis 2011
- Doses distribuees vs actes de vaccination par saison (5 saisons IQVIA)
- Ecart avec l'objectif OMS de 75%

### Optimiser la distribution
- KPIs de la derniere campagne (doses, actes, taux d'utilisation, pharmacies)
- Comparaison doses/actes par saison en barres groupees
- Taux d'utilisation par region (identification du gaspillage)
- Doses non utilisees par region avec recommandation d'action (reduire/maintenir/augmenter)
- Evolution du taux d'utilisation regional sur 5 saisons

### Anticiper les flux
- Series temporelles des passages urgences grippe et actes SOS Medecins depuis 2020
- Ventilation par tranche d'age (0-4, 5-14, 15-64, 65+)
- Visualisation de la saisonnalite (pics janvier-fevrier)

### Ameliorer l'acces aux soins
- Carte de France interactive par departement (couverture vaccinale ou score de risque)
- Top 15 des departements a risque avec profil (CRITIQUE, PRIORITAIRE, ATTENTION, SURVEILLANCE)
- Correlation couverture vaccinale vs taux d'urgences (nuage de points + regression)
- Heatmap regionale couverture 65+ par annee
- Tableau d'action avec recommandations par departement

## Donnees utilisees

| Source | Contenu | Periode |
|--------|---------|---------|
| IQVIA (data.gouv.fr) | Doses distribuees et actes vaccination en pharmacie | 2021-2026 (5 saisons) |
| Sante publique France (ODISSE) | Couverture vaccinale grippe dept/region/national | 2011-2024 |
| Sante publique France (ODISSE) | Passages urgences et actes SOS Medecins grippe | 2020-2026 |
| france-geojson (GitHub) | Contours geographiques des departements | - |

Toutes les donnees sont publiques et accessibles librement.

## Modeles predictifs (notebook + Streamlit)

Le notebook Colab et le dashboard Streamlit integrent en complement :

- **Prophet** (Meta) : prevision des passages urgences, actes SOS Medecins et demande en doses a 52 semaines. Configure en mode multiplicatif pour capter l'amplitude variable des epidemies.
- **Random Forest** (scikit-learn) : second modele de prevision des urgences, avec validation croisee temporelle (5 folds). Sert de contre-verification et permet de mesurer l'importance des features.
- **Score de risque composite** : croisement du deficit de couverture vaccinale et de la pression aux urgences, normalise entre 0 et 1 par departement.

## Stack technique

- **React + Vite** : interface du dashboard
- **Plotly (react-plotly.js)** : graphiques interactifs et cartes choroplethes
- **Python + pandas** : preparation des donnees (`prepare_data.py`)
- **Prophet + scikit-learn** : modeles predictifs (notebook + Streamlit)
- **Streamlit** : version alternative du dashboard avec modeles integres

## Lancer le projet

### Dashboard React

```bash
# Preparer les donnees JSON
source .venv/bin/activate
python prepare_data.py

# Lancer le dashboard
cd dashboard
npm install
npm run dev
```

Ouvrir http://localhost:5173

### Dashboard Streamlit (avec modeles)

```bash
source .venv/bin/activate
pip install -r requirements.txt
streamlit run app.py
```

Ouvrir http://localhost:8501

## Structure du projet

```
THACk/
  data/                          # Donnees brutes CSV
    iqvia/                       # 5 saisons de donnees IQVIA
    couverture_vaccinale/        # Dept, region, national
    urgences_sos/                # Dept, region, national
  dashboard/                     # Dashboard React
    public/data/                 # JSON pre-calcules
    src/App.jsx                  # Application principale
  app.py                         # Dashboard Streamlit
  prepare_data.py                # Script de preparation des donnees
  hackathon_grippe.ipynb         # Notebook d'analyse (Google Colab)
  requirements.txt               # Dependances Python
```

## Equipe

Projet realise dans le cadre du hackathon Epitech T-HAK — "Leveraging Open Data to Serve the Public Interest".
