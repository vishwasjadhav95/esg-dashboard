/* eslint-disable no-console */
export default function decorate(block) {
    // Add container class
    block.classList.add('esg-metrics-block');

    // Extract metrics from table
    const metricsConfig = [];
    const container = block;

    [...block.children].forEach((row) => {
        const cells = [...row.children];
        if (cells.length >= 2) {
            const getText = (cell) => {
                const p = cell.querySelector('p');
                return p ? p.textContent.trim() : cell.textContent.trim();
            };

            const name = getText(cells[0]);
            const description = getText(cells[1]);

            if (name && description && name !== '---') {
                metricsConfig.push({
                    name,
                    description,
                });
            }
        }
    });

    // Helper functions
    function setupEventListeners() {
        // Listen for analysis complete event
        window.addEventListener('esg-analysis-complete', handleAnalysisComplete);
    }

    function handleAnalysisComplete(event) {
        const { data } = event.detail;

        // Show metrics section
        container.querySelector('.esg-metrics-table').style.display = 'block';
        container.querySelector('.metrics-empty')?.remove();

        // Update metrics with real data
        updateMetrics(data);

        // Update improvements
        updateImprovements(data);
    }

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

        metrics.forEach((metric, index) => {
            setTimeout(() => {
                const element = container.querySelector(`[data-metric="${metric.key}"] .metric-value`);
                if (element) {
                    animateNumber(element, 0, metric.value, 1000);
                }
            }, index * 200);
        });
    }

    function updateImprovements(data) {
        const improvementsContainer = container.querySelector('.improvement-section');
        if (!improvementsContainer || !data.recommendations) return;

        const limitedRecommendations = data.recommendations.slice(0, 4);
        improvementsContainer.innerHTML = `
      <h4>🎯 Key Improvement Areas</h4>
      <div class="improvement-grid">
        ${limitedRecommendations.map((rec) => `
          <div class="improvement-item">
            <div class="improvement-header">
              <span class="priority ${rec.priority || 'medium'}">${rec.priority || 'Medium'}</span>
              <span class="category">ESG</span>
            </div>
            <p>${rec.text}</p>
          </div>
        `).join('')}
      </div>
    `;
    }

    function animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.round(start + (end - start) * progress);
            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    // Create the metrics layout
    block.innerHTML = `
    <div class="esg-metrics-table">
      <div class="metrics-header">
        <h2>📊 ESG Performance Metrics</h2>
        <p>Key performance indicators based on analysis results</p>
      </div>
      
      <div class="metrics-grid">
        ${metricsConfig.map((metric, index) => {
        const metricKeys = ['overall', 'environmental', 'social', 'governance', 'improvements'];
        const colors = ['blue', 'green', 'purple', 'orange', 'red'];
        return `
          <div class="metric-card" data-metric="${metricKeys[index] || 'default'}">
            <div class="metric-header">
              <h3>${metric.name}</h3>
            </div>
            <div class="metric-value ${colors[index] || 'blue'}">--</div>
            <div class="metric-description">${metric.description}</div>
            <div class="metric-progress">
              <div class="progress-bar">
                <div class="progress-fill ${colors[index] || 'blue'}"></div>
              </div>
            </div>
          </div>
        `;
    }).join('')}
      </div>
      
      <div class="improvement-section">
        <p>Complete analysis to see improvement recommendations</p>
      </div>
    </div>
    
    <div class="metrics-empty">
      <h3>📊 Metrics Ready</h3>
      <p>Run an ESG analysis to see detailed performance metrics and recommendations.</p>
    </div>
  `;

    // Setup event listeners
    setupEventListeners();
} 