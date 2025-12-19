# Research: Mushroom Fruiting Triggers & Phenology

## 1. Precipitation Lag & Accumulation
Mushrooms do not fruit *during* rain; they fruit *after* the mycelium has absorbed sufficient moisture and triggered primordia formation.

*   **Golden Chanterelle (*Cantharellus californicus*)**:
    *   **Trigger**: "Deep soak" required.
    *   **Threshold**: >2 inches (50mm) of cumulative rain over 14 days.
    *   **Lag Time**: 14-21 days after the "trigger" rain event.
    *   **Sustaining**: Requires soil moisture >60% to continue fruiting.
    *   **Source**: Local mycological observations (Mendocino Coast Mushroom Club) & general *Cantharellus* phenology.

*   **Porcini (*Boletus edulis* var. *grandedulis*)**:
    *   **Trigger**: "Cold Shock" + Rain.
    *   **Threshold**: >1 inch (25mm) rain.
    *   **Lag Time**: 10-14 days.
    *   **Key Factor**: Soil temperature drop below 15°C (59°F) is a critical trigger for primordia.

*   **Candy Cap (*Lactarius rubidus*)**:
    *   **Trigger**: Consistent moisture.
    *   **Threshold**: >1 inch rain.
    *   **Lag Time**: 7-10 days (faster than Chanterelles).
    *   **Sustaining**: Very sensitive to drying out; needs high humidity/fog.

## 2. Temperature Triggers (Cold Shock)
Many basidiomycetes require a temperature drop to switch from vegetative growth (mycelium) to reproductive growth (mushrooms).

*   **The "Cold Shock" Mechanism**: A drop of 5-10°C (10-15°F) often signals the arrival of autumn/winter rains.
*   **Application**:
    *   Calculate `Temp_Delta = Avg_Temp_Last_Week - Avg_Temp_Current_Week`.
    *   If `Temp_Delta > 5°C` AND `Soil_Moisture > Threshold`, probability skyrockets.

## 3. Host Specificity Weights
Refining the "Host Bonus" based on primary vs. secondary hosts.

| Guild | Primary Host (Weight 1.5x) | Secondary Host (Weight 1.2x) |
| :--- | :--- | :--- |
| **Chanterelle** | Coast Live Oak (*Q. agrifolia*) | Tanoak (*N. densiflorus*) |
| **Porcini** | Bishop Pine (*P. muricata*) | Douglas Fir (*P. menziesii*) |
| **Candy Cap** | Coast Live Oak | Bishop Pine |
| **Hedgehog** | Douglas Fir | Tanoak |
| **Black Trumpet** | Tanoak | Coast Live Oak |

## 4. Proposed Algorithm Logic
```python
# Pseudo-code for new probability calculation

def calculate_probability(location):
    # 1. Base Habitat Check (NLCD)
    if not is_forest(location): return 0.0
    
    # 2. Host Tree Proximity
    host_score = get_host_score(location, guild) # 1.0, 1.2, or 1.5
    
    # 3. Moisture Accumulation (The "Tank")
    rain_total = get_precip_last_14_days(location)
    if rain_total < guild.min_rain: return 0.1 # Too dry
    
    # 4. The "Lag" Factor
    # Did the rain happen 2 weeks ago?
    days_since_peak_rain = get_days_since_heavy_rain(location)
    lag_score = gaussian_curve(days_since_peak_rain, optimal=guild.lag_days)
    
    # 5. Temperature Shock (for Boletes/etc)
    temp_shock = get_temp_drop(location)
    shock_score = 1.0
    if guild.needs_shock and temp_shock > 5:
        shock_score = 1.3
        
    return base * host_score * lag_score * shock_score
```
