# Data Research: Host Trees & Elevation

## Host Tree Taxon IDs (iNaturalist)
We will use these IDs to fetch "potential habitat" layers.

| Common Name | Scientific Name | iNaturalist Taxon ID | Notes |
| :--- | :--- | :--- | :--- |
| **Coast Live Oak** | *Quercus agrifolia* | `47850` | Primary host for *Cantharellus californicus* & *Lactarius rubidus* |
| **Tanoak** | *Notholithocarpus densiflorus* | `69823` | Key host for *Cantharellus*, *Boletus*, *Tricholoma* |
| **Douglas Fir** | *Pseudotsuga menziesii* | `48256` | Host for *Cantharellus formosus*, *Hydnum*, *Boletus* |
| **Bishop Pine** | *Pinus muricata* | `54130` | Specific host for *Boletus edulis* (coastal variety) |
| **Pacific Madrone** | *Arbutus menziesii* | `51046` | Often associated with *Cantharellus* and *Boletus* |

## Elevation Ranges (Target Guilds)
Elevation acts as a filter. If an observation is outside this range, probability is penalized.

| Guild | Species | Min Elev (ft) | Max Elev (ft) | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Golden Chanterelle** | *Cantharellus californicus* | 0 | 2,500 | Coastal oak woodlands; rarely higher in winter |
| **Hedgehog** | *Hydnum umbilicatum* | 0 | 3,500 | Coastal & foothills; tolerant of cooler temps |
| **Black Trumpet** | *Craterellus cornucopioides* | 100 | 2,000 | Mixed hardwood forests; lower elevations |
| **Candy Cap** | *Lactarius rubidus* | 0 | 2,500 | Coastal pine/oak; similar to Chanterelle range |
| **Porcini (King)** | *Boletus edulis* | 0 | 1,000 (Coastal) <br> 3,000+ (Mountain) | **Complex**: Coastal var. (Grand Edulis) is low elevation; Mountain var. is high. We will focus on **Coastal** for now. |
| **Burn Morel** | *Morchella* spp. | 2,000 | 8,000 | **Exception**: Needs fire + elevation. Spring fruiter. |

## Phenology (Seasonality)
We will calculate a "Day of Year" (DOY) score.
*   **Peak Season**: Nov 15 - Mar 15 (Coastal California)
*   **Early Season**: Oct 15 - Nov 15
*   **Late Season**: Mar 15 - Apr 15
