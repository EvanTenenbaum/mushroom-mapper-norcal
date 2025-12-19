export const addPublicLandsLayer = (map: google.maps.Map) => {
  const url = "/data/layers/public-lands.json";
  
  map.data.loadGeoJson(url, { idPropertyName: "name" }, (features) => {
    // Style the layer
    map.data.setStyle((feature) => {
      const agency = feature.getProperty("agency");
      let color = "#228B22"; // Default Forest Green
      
      if (agency === "NPS") color = "#4B5320"; // Army Green
      if (agency === "CAL FIRE") color = "#8B4513"; // Saddle Brown
      
      return {
        fillColor: color,
        fillOpacity: 0.2,
        strokeColor: color,
        strokeWeight: 1,
        clickable: true
      };
    });
  });

  // Add click listener for info windows
  const infoWindow = new google.maps.InfoWindow();
  
  const clickListener = map.data.addListener("click", (event: google.maps.Data.MouseEvent) => {
    const name = event.feature.getProperty("name");
    const agency = event.feature.getProperty("agency");
    const access = event.feature.getProperty("access");
    
    infoWindow.setContent(`
      <div style="padding: 8px;">
        <h3 style="margin: 0 0 4px 0; font-weight: bold;">${name}</h3>
        <p style="margin: 0; font-size: 12px; color: #666;">${agency}</p>
        <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: 500; color: ${access === 'Open' ? 'green' : 'orange'};">
          Access: ${access}
        </p>
      </div>
    `);
    infoWindow.setPosition(event.latLng);
    infoWindow.open(map);
  });

  return {
    remove: () => {
      map.data.forEach((feature) => {
        map.data.remove(feature);
      });
      google.maps.event.removeListener(clickListener);
      infoWindow.close();
    }
  };
};
