# NLCD Land Cover Integration Strategy

## Target NLCD Codes (Habitat)
We will use these codes to **allow** probability. All other codes (Urban, Water, Barren) will be masked out.

| Code | Class Name | Description | Target Guilds |
| :--- | :--- | :--- | :--- |
| **41** | Deciduous Forest | Trees >5m tall, >20% cover, >75% shedding foliage | Chanterelle, Black Trumpet, Morel |
| **42** | Evergreen Forest | Trees >5m tall, >20% cover, >75% retaining foliage | Porcini, Hedgehog, Candy Cap |
| **43** | Mixed Forest | Neither deciduous nor evergreen dominates (>20% of each) | All Guilds (Generalist) |
| **52** | Shrub/Scrub | Shrubs <5m tall, >20% cover | Manzanita/Madrone associates |
| **90** | Woody Wetlands | Forest or shrubland with saturated soil | Late season Chanterelles |

## Masked Codes (Non-Habitat)
*   **11**: Open Water
*   **21-24**: Developed (Urban/Suburban)
*   **31**: Barren Land (Rock/Sand)
*   **81-82**: Pasture/Crops (unless field mushrooms, but we focus on forest species)

## Data Access Strategy
Since we cannot easily download the entire 30GB NLCD raster for the whole US in this environment, we will use the **USGS MRLC WMS (Web Map Service)** or a **Point Query API** if available.

**Alternative**: For the prototype, we can use a **simplified "Greenness" check** using a static map layer or a small, cropped GeoTIFF of Northern California if we can find one hosted.

**Plan B (API)**: Use the **USGS National Map API** to query land cover at specific lat/lng points during the probability generation phase.
URL: `https://www.mrlc.gov/geoserver/NLCD_Land_Cover/wms`
