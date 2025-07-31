/* eslint-disable no-console, no-undef */
export default function decorate(block) {
    console.log('🗺️ ESG Map - Interactive World Map');

    // Add container class
    block.classList.add('esg-map-block');

    // Global variables for map functionality
    let map;
    const countryLayers = {};
    let selectedCountries = [];

    // Extract countries from table
    const countries = [];

    [...block.children].forEach((row) => {
        const cells = [...row.children];
        if (cells.length >= 5) {
            const getText = (cell) => {
                const p = cell.querySelector('p');
                return p ? p.textContent.trim() : cell.textContent.trim();
            };

            const fullName = getText(cells[0]);
            const code = getText(cells[1]);
            const name = getText(cells[2]);
            const lat = parseFloat(getText(cells[3]));
            const lng = parseFloat(getText(cells[4]));

            if (fullName && code && name && !Number.isNaN(lat) && !Number.isNaN(lng) && code !== '---') {
                countries.push({
                    fullName,
                    code,
                    name,
                    coords: [lat, lng],
                });
                console.log(`✅ Added country: ${name} (${code})`);
            }
        }
    });

    // Helper functions
    function loadLeaflet() {
        return new Promise((resolve) => {
            if (window.L) {
                resolve();
                return;
            }

            // Load CSS
            const css = document.createElement('link');
            css.rel = 'stylesheet';
            css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            css.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
            css.crossOrigin = '';
            document.head.appendChild(css);

            // Load JS
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
            script.crossOrigin = '';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }

    function initializeCountryMap() {
        // Initialize the map
        map = L.map('map').setView([20, 0], 2);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
        }).addTo(map);

        loadCountryBoundaries();
    }

    function loadCountryBoundaries() {
        countries.forEach((country) => {
            // Add a marker for each country
            const marker = L.circleMarker(country.coords, {
                radius: 8,
                fillColor: '#3b82f6',
                color: '#1e40af',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.7,
            }).addTo(map);

            // Store reference to the marker
            countryLayers[country.code] = marker;

            // Add popup
            marker.bindPopup(`
        <div style="text-align: center; font-weight: bold;">
          ${country.name}
          <br>
          <small>Click to select for ESG analysis</small>
        </div>
      `);

            // Add click event
            marker.on('click', () => {
                toggleCountrySelection(country.code, country.name);
            });

            // Add hover effects
            marker.on('mouseover', function handleMouseOver() {
                this.setStyle({
                    fillOpacity: 0.9,
                    radius: 10,
                });
            });

            marker.on('mouseout', function handleMouseOut() {
                if (!selectedCountries.some((c) => c.code === country.code)) {
                    this.setStyle({
                        fillOpacity: 0.7,
                        radius: 8,
                    });
                }
            });
        });

        console.log(`✅ Map initialized with ${countries.length} country markers`);
    }

    function toggleCountrySelection(countryCode, countryName) {
        const marker = countryLayers[countryCode];
        const isSelected = selectedCountries.some((c) => c.code === countryCode);

        if (isSelected) {
            // Deselect country
            selectedCountries = selectedCountries.filter((c) => c.code !== countryCode);
            marker.setStyle({
                fillColor: '#3b82f6',
                color: '#1e40af',
                radius: 8,
                fillOpacity: 0.7,
            });
        } else {
            // Select country
            selectedCountries.push({
                code: countryCode,
                name: countryName,
            });
            marker.setStyle({
                fillColor: '#ef4444',
                color: '#dc2626',
                radius: 10,
                fillOpacity: 0.9,
            });
        }

        updateSelectedCountriesDisplay();

        // Set global variable for dashboard to read
        window.selectedCountries = selectedCountries;

        // Dispatch event for other blocks
        window.dispatchEvent(new CustomEvent('esg-countries-updated', {
            detail: { countries: selectedCountries },
        }));

        console.log('✅ Selected countries:', selectedCountries.map((c) => c.name));
    }

    function updateSelectedCountriesDisplay() {
        const container = document.getElementById('selectedCountriesDisplay');
        const countDisplay = document.getElementById('selectedCountriesCount');

        countDisplay.textContent = selectedCountries.length;

        container.innerHTML = selectedCountries.map((country) => `
      <span class="country-tag">
        ${country.name}
        <button onclick="window.removeCountry('${country.code}')" class="remove-btn">×</button>
      </span>
    `).join('');
    }

    // Create the map layout
    block.innerHTML = `
    <div class="map-header">
      <h2>🗺️ Interactive World Map</h2>
      <div class="map-info">
        <span class="selection-counter">Selected: <span id="selectedCountriesCount">0</span> countries</span>
      </div>
    </div>
    <div id="map" class="world-map"></div>
    <div class="selected-countries" id="selectedCountriesDisplay"></div>
  `;

    // Load Leaflet and initialize map
    loadLeaflet().then(() => {
        initializeCountryMap();
    });

    // Global remove country function
    window.removeCountry = function removeCountry(countryCode) {
        selectedCountries = selectedCountries.filter((c) => c.code !== countryCode);

        // Update map marker
        const marker = countryLayers[countryCode];
        if (marker) {
            marker.setStyle({
                fillColor: '#3b82f6',
                color: '#1e40af',
                radius: 8,
                fillOpacity: 0.7,
            });
        }

        updateSelectedCountriesDisplay();

        // Update global variable for dashboard to read
        window.selectedCountries = selectedCountries;

        // Dispatch event for other blocks
        window.dispatchEvent(new CustomEvent('esg-countries-updated', {
            detail: { countries: selectedCountries },
        }));
    };

    console.log(`✅ ESG Map: ${countries.length} countries loaded`);
} 