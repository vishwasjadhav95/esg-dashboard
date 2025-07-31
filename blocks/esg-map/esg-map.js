/* eslint-disable no-console, no-undef */
export default function decorate(block) {
  console.log('🗺️ ESG Map - Interactive World Map');

  // Add container class
  block.classList.add('esg-map-block');

  // Global variables for map functionality
  let map;
  const countryLayers = new Map();
  const selectedCountries = [];

  // Extract countries from DA table
  const countries = [];
  console.log('📋 Block children count:', block.children.length);

  [...block.children].forEach((row, index) => {
    const cells = [...row.children];
    console.log(`Row ${index}:`, [...row.children].map((cell) => cell.textContent.trim()));

    if (cells.length >= 6) {
      const getText = (cell) => {
        const p = cell.querySelector('p');
        return p ? p.textContent.trim() : cell.textContent.trim();
      };

      const name = getText(cells[0]);
      const code = getText(cells[1]);
      const flag = getText(cells[2]);
      const displayName = getText(cells[3]);
      const lat = parseFloat(getText(cells[4]));
      const lon = parseFloat(getText(cells[5]));

      if (name && code && name !== '---' && !Number.isNaN(lat) && !Number.isNaN(lon)) {
        countries.push({
          name,
          code,
          flag,
          displayName,
          lat,
          lon,
        });
        console.log(`✅ Added country from DA: ${flag} ${name} (${code}) at [${lat}, ${lon}]`);
      }
    }
  });

  // Fallback to hardcoded countries if DA parsing failed
  if (countries.length === 0) {
    console.warn('⚠️ No countries found in DA content, using fallback hardcoded countries');
    const fallbackCountries = [
      {
        name: 'United States', code: 'USA', flag: '🇺🇸', lat: 39.8283, lon: -98.5795,
      },
      {
        name: 'Canada', code: 'CAN', flag: '🇨🇦', lat: 56.1304, lon: -106.3468,
      },
      {
        name: 'United Kingdom', code: 'GBR', flag: '🇬🇧', lat: 55.3781, lon: -3.4360,
      },
      {
        name: 'France', code: 'FRA', flag: '🇫🇷', lat: 46.2276, lon: 2.2137,
      },
      {
        name: 'Germany', code: 'DEU', flag: '🇩🇪', lat: 51.1657, lon: 10.4515,
      },
      {
        name: 'Netherlands', code: 'NLD', flag: '🇳🇱', lat: 52.1326, lon: 5.2913,
      },
      {
        name: 'Switzerland', code: 'CHE', flag: '🇨🇭', lat: 46.8182, lon: 8.2275,
      },
      {
        name: 'Sweden', code: 'SWE', flag: '🇸🇪', lat: 60.1282, lon: 18.6435,
      },
      {
        name: 'Norway', code: 'NOR', flag: '🇳🇴', lat: 60.4720, lon: 8.4689,
      },
      {
        name: 'China', code: 'CHN', flag: '🇨🇳', lat: 35.8617, lon: 104.1954,
      },
      {
        name: 'Japan', code: 'JPN', flag: '🇯🇵', lat: 36.2048, lon: 138.2529,
      },
      {
        name: 'Australia', code: 'AUS', flag: '🇦🇺', lat: -25.2744, lon: 133.7751,
      },
      {
        name: 'Brazil', code: 'BRA', flag: '🇧🇷', lat: -14.2350, lon: -51.9253,
      },
      {
        name: 'India', code: 'IND', flag: '🇮🇳', lat: 20.5937, lon: 78.9629,
      },
      {
        name: 'South Korea', code: 'KOR', flag: '🇰🇷', lat: 35.9078, lon: 127.7669,
      },
      {
        name: 'Mexico', code: 'MEX', flag: '🇲🇽', lat: 23.6345, lon: -102.5528,
      },
      {
        name: 'Russia', code: 'RUS', flag: '🇷🇺', lat: 61.5240, lon: 105.3188,
      },
      {
        name: 'Indonesia', code: 'IDN', flag: '🇮🇩', lat: -0.7893, lon: 113.9213,
      },
    ];
    countries.push(...fallbackCountries);
    console.log(`🔄 Added ${fallbackCountries.length} fallback countries`);
  }

  console.log(`🌍 Loaded ${countries.length} countries total`);
  console.log('📋 Countries list:', countries.map((c) => `${c.flag} ${c.name} (${c.code})`));

  // Function to update selected countries display
  function updateSelectedCountriesDisplay() {
    const selectedList = document.getElementById('selected-countries-list');

    if (!selectedList) {
      console.warn('❌ selected-countries-list element not found');
      return;
    }

    if (selectedCountries.length === 0) {
      selectedList.innerHTML = '<div class="no-selection">No countries selected</div>';
    } else {
      selectedList.innerHTML = selectedCountries.map((country) => `
        <div class="selected-country-tag" data-code="${country.code}">
          <span class="country-flag">${country.flag}</span>
          <span class="country-name">${country.name}</span>
          <button class="remove-country" onclick="window.removeCountry('${country.code}')" aria-label="Remove ${country.name}">×</button>
        </div>
      `).join('');
    }

    console.log('✅ Selected countries updated:', selectedCountries.map((c) => `${c.name} (${c.code})`));
  }

  // Function to toggle country selection
  function toggleCountrySelection(countryData) {
    console.log('🔄 Toggling country:', countryData.name);
    const existingIndex = selectedCountries.findIndex((c) => c.code === countryData.code);

    if (existingIndex > -1) {
      // Remove country
      selectedCountries.splice(existingIndex, 1);
      const marker = countryLayers.get(countryData.code);
      if (marker) {
        marker.setStyle({
          fillColor: '#3b82f6',
          fillOpacity: 0.7,
          color: '#1e40af',
          weight: 2,
          radius: 8,
        });
      }
      console.log('➖ Removed country:', countryData.name);
    } else {
      // Add country
      selectedCountries.push(countryData);
      const marker = countryLayers.get(countryData.code);
      if (marker) {
        marker.setStyle({
          fillColor: '#ef4444',
          fillOpacity: 0.9,
          color: '#dc2626',
          weight: 3,
          radius: 10,
        });
      }
      console.log('➕ Added country:', countryData.name);
    }

    updateSelectedCountriesDisplay();

    // Update global variable for dashboard access
    window.selectedCountries = selectedCountries;

    // Dispatch event for other blocks
    window.dispatchEvent(new CustomEvent('esg-countries-updated', {
      detail: { countries: selectedCountries },
    }));
  }

  // Function to load country boundaries
  function loadCountryBoundaries() {
    console.log('🗺️ Loading country boundaries...');
    if (!map) {
      console.error('❌ Map not initialized');
      return;
    }

    countries.forEach((country) => {
      console.log(`📍 Adding marker for ${country.name} at [${country.lat}, ${country.lon}]`);

      // Create circle marker for each country
      const marker = L.circleMarker([country.lat, country.lon], {
        radius: 8,
        fillColor: '#3b82f6',
        color: '#1e40af',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7,
      });

      // Add click handler
      marker.on('click', () => {
        console.log('🖱️ Country clicked:', country.name);
        toggleCountrySelection(country);
      });

      // Add hover effects
      marker.on('mouseover', function mouseOverHandler() {
        if (!selectedCountries.find((c) => c.code === country.code)) {
          this.setStyle({
            fillOpacity: 0.9,
            radius: 12,
            fillColor: '#60a5fa',
          });
        }
      });

      marker.on('mouseout', function mouseOutHandler() {
        if (!selectedCountries.find((c) => c.code === country.code)) {
          this.setStyle({
            fillOpacity: 0.7,
            radius: 8,
            fillColor: '#3b82f6',
          });
        }
      });

      // Add to map and store reference
      marker.addTo(map);
      countryLayers.set(country.code, marker);

      // Add popup
      marker.bindPopup(`
        <div class="country-popup">
          <div class="popup-header">
            <span class="popup-flag">${country.flag}</span>
            <span class="popup-name">${country.name}</span>
          </div>
          <div class="popup-code">Code: ${country.code}</div>
          <div class="popup-action">Click to select for analysis</div>
        </div>
      `);
    });

    console.log(`✅ Added ${countries.length} country markers to map`);
  }

  // Create the map layout
  console.log('🏗️ Creating map layout...');
  block.innerHTML = `
    <div class="map-header">
      <h2>🗺️ Country Selection</h2>
      <p><strong>Click the blue circles on the map to select countries</strong> - they will turn red when selected</p>
    </div>

    <div class="map-container">
      <div id="map" style="height: 400px; width: 100%; border-radius: 12px;"></div>
      <div class="map-tooltip">
        💡 Click blue circles to select countries
      </div>
    </div>

    <div class="selected-countries">
      <div id="selected-countries-list">
        <div class="no-selection">No countries selected</div>
      </div>
    </div>
  `;

  // Initialize the map
  function initializeCountryMap() {
    console.log('🚀 Initializing country map...');
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error('❌ Map element not found');
      return;
    }

    console.log('📦 Leaflet available:', !!window.L);
    if (!window.L) {
      console.error('❌ Leaflet not loaded');
      return;
    }

    try {
      // Create Leaflet map
      console.log('🗺️ Creating Leaflet map...');
      map = L.map('map').setView([20, 0], 2);

      // Add OpenStreetMap tiles
      console.log('🌍 Adding tile layer...');
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ' OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      console.log('✅ Map created successfully');

      // Load country boundaries after map is ready
      setTimeout(() => {
        loadCountryBoundaries();
      }, 500);
    } catch (error) {
      console.error('❌ Error creating map:', error);
    }
  }

  // Global function to remove countries (for remove buttons)
  window.removeCountry = function removeCountry(code) {
    console.log('🗑️ Removing country:', code);
    const countryIndex = selectedCountries.findIndex((c) => c.code === code);
    if (countryIndex > -1) {
      selectedCountries.splice(countryIndex, 1);

      // Update marker style
      const marker = countryLayers.get(code);
      if (marker) {
        marker.setStyle({
          fillColor: '#3b82f6',
          fillOpacity: 0.7,
          color: '#1e40af',
          weight: 2,
          radius: 8,
        });
      }

      updateSelectedCountriesDisplay();

      // Update global variable and dispatch event
      window.selectedCountries = selectedCountries;
      window.dispatchEvent(new CustomEvent('esg-countries-updated', {
        detail: { countries: selectedCountries },
      }));
    }
  };

  // Function to load Leaflet library
  function loadLeaflet() {
    console.log('📚 Loading Leaflet library...');
    return new Promise((resolve) => {
      if (window.L) {
        console.log('✅ Leaflet already loaded');
        resolve();
        return;
      }

      // Load CSS
      console.log('🎨 Loading Leaflet CSS...');
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      css.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      css.crossOrigin = '';
      document.head.appendChild(css);

      // Load JS
      console.log('🔧 Loading Leaflet JS...');
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.onload = () => {
        console.log('✅ Leaflet JS loaded successfully');
        resolve();
      };
      script.onerror = () => {
        console.error('❌ Failed to load Leaflet JS');
        resolve(); // Still resolve to prevent hanging
      };
      document.head.appendChild(script);
    });
  }

  // Load Leaflet and then initialize map
  console.log('🔄 Starting map initialization process...');
  loadLeaflet().then(() => {
    console.log('⏰ Waiting 1 second before initializing map...');
    setTimeout(initializeCountryMap, 1000);
  });

  console.log('✅ ESG Map: Setup complete');
}
