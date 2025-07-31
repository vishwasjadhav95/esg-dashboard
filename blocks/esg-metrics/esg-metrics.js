/* eslint-disable no-console */
export default function decorate(block) {
  console.log('📊 ESG Performance Metrics');

  // Add container class
  block.classList.add('esg-metrics-block');

  // Helper function to animate numbers
  function animateNumber(element, targetValue, duration = 1500) {
    const startValue = 0;
    const startTime = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentValue = Math.round(startValue + (targetValue - startValue) * progress);

      element.textContent = currentValue;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }

  // Function to update metrics display
  function updateMetrics(data) {
    const metrics = [
      {
        key: 'overall',
        value: data.overall?.score || 0,
        label: 'Overall ESG Score',
        color: 'blue',
      },
      {
        key: 'environmental',
        value: data.overall?.environmental || 0,
        label: 'Environmental Score',
        color: 'green',
      },
      {
        key: 'social',
        value: data.overall?.social || 0,
        label: 'Social Score',
        color: 'purple',
      },
      {
        key: 'governance',
        value: data.overall?.governance || 0,
        label: 'Governance Score',
        color: 'orange',
      },
      {
        key: 'improvements',
        value: data.recommendations?.length || 0,
        label: 'Improvement Areas',
        color: 'red',
      },
    ];

    metrics.forEach((metric) => {
      const element = document.querySelector(`[data-metric="${metric.key}"] .metric-value`);
      if (element) {
        animateNumber(element, metric.value);
      }
    });
  }

  // Function to update improvements display
  function updateImprovements(data) {
    const improvementsContainer = document.querySelector('.improvements-list');
    if (!improvementsContainer) return;

    if (data.recommendations && data.recommendations.length > 0) {
      improvementsContainer.innerHTML = data.recommendations
        .slice(0, 3)
        .map((rec) => `
          <div class="improvement-item priority-${rec.priority}">
            <span class="priority-indicator"></span>
            <span class="improvement-text">${rec.text}</span>
          </div>
        `)
        .join('');
    } else {
      improvementsContainer.innerHTML = '<div class="no-improvements">No specific recommendations available</div>';
    }
  }

  // Function to handle analysis complete event
  function handleAnalysisComplete(event) {
    const { data } = event.detail;
    console.log('📊 Metrics received analysis data:', data);

    updateMetrics(data);
    updateImprovements(data);
  }

  // Extract metrics configuration from table
  const metrics = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const getText = (cell) => {
        const p = cell.querySelector('p');
        return p ? p.textContent.trim() : cell.textContent.trim();
      };

      const label = getText(cells[0]);
      const description = getText(cells[1]);

      if (label && description && label !== '---') {
        metrics.push({ label, description });
      }
    }
  });

  // Create metrics layout
  block.innerHTML = `
    <div class="metrics-header">
      <h2>📊 ESG Performance Metrics</h2>
      <p>Key performance indicators based on analysis results</p>
    </div>

    <div class="metrics-grid">
      ${metrics.map((metric, index) => {
    const metricKeys = ['overall', 'environmental', 'social', 'governance', 'improvements'];
    const colors = ['blue', 'green', 'purple', 'orange', 'red'];
    const metricKey = metricKeys[index] || 'general';
    const color = colors[index] || 'gray';

    return `
        <div class="metric-card ${color}" data-metric="${metricKey}">
          <div class="metric-content">
            <h3>${metric.label}</h3>
            <div class="metric-value">0</div>
            <p>${metric.description}</p>
          </div>
        </div>
      `;
  }).join('')}
    </div>

    <div class="improvements-section">
      <h3>Key Insights</h3>
      <div class="improvements-list">
        <div class="no-analysis">Generate an analysis to see recommendations</div>
      </div>
    </div>
  `;

  // Setup event listeners
  function setupEventListeners() {
    window.addEventListener('esg-analysis-complete', handleAnalysisComplete);
  }

  // Initialize
  setupEventListeners();

  console.log(`✅ ESG Metrics: ${metrics.length} metric cards created`);
}
