// ESG Metrics Block
export default function decorate(block) {
  // Clear the block content
  block.textContent = '';
  
  // Create the main container
  const container = document.createElement('div');
  container.className = 'esg-metrics-container';
  
  // Create metrics section
  const metricsSection = document.createElement('div');
  metricsSection.className = 'metrics-section';
  metricsSection.id = 'esg-metrics';
  metricsSection.style.display = 'none'; // Initially hidden
  
  // Metric cards
  const metrics = [
    { id: 'overallScore', label: 'Overall ESG Score', value: '0', icon: '📊' },
    { id: 'environmentalScore', label: 'Environmental Score', value: '0', icon: '🌱' },
    { id: 'socialScore', label: 'Social Score', value: '0', icon: '👥' },
    { id: 'governanceScore', label: 'Governance Score', value: '0', icon: '🏛️' },
    { id: 'improvementAreas', label: 'Improvement Areas', value: '0', icon: '🎯' }
  ];
  
  metrics.forEach(metric => {
    const metricCard = document.createElement('div');
    metricCard.className = 'metric-card';
    
    const metricIcon = document.createElement('div');
    metricIcon.className = 'metric-icon';
    metricIcon.textContent = metric.icon;
    
    const metricValue = document.createElement('div');
    metricValue.className = 'metric-value';
    metricValue.id = metric.id;
    metricValue.textContent = metric.value;
    
    const metricLabel = document.createElement('div');
    metricLabel.className = 'metric-label';
    metricLabel.textContent = metric.label;
    
    metricCard.appendChild(metricIcon);
    metricCard.appendChild(metricValue);
    metricCard.appendChild(metricLabel);
    
    metricsSection.appendChild(metricCard);
  });
  
  container.appendChild(metricsSection);
  
  // Create improvements section
  const improvementsSection = document.createElement('div');
  improvementsSection.className = 'improvements-section';
  improvementsSection.id = 'esg-improvements';
  improvementsSection.style.display = 'none'; // Initially hidden
  
  const improvementsTitle = document.createElement('h3');
  improvementsTitle.textContent = '📈 Improvement Recommendations';
  improvementsTitle.style.cssText = 'margin-bottom: 2rem; color: #1e293b; font-size: 1.5rem; font-weight: 600;';
  
  const improvementsContainer = document.createElement('div');
  improvementsContainer.className = 'improvements-grid';
  improvementsContainer.id = 'improvementsContainer';
  
  improvementsSection.appendChild(improvementsTitle);
  improvementsSection.appendChild(improvementsContainer);
  
  container.appendChild(improvementsSection);
  block.appendChild(container);
  
  // Setup event listeners
  setupEventListeners();
  
  // Setup event listeners
  function setupEventListeners() {
    document.addEventListener('esg-analysis-complete', handleAnalysisComplete);
  }
  
  // Handle analysis complete event
  function handleAnalysisComplete(event) {
    const { data, parameters, countries, analysisType } = event.detail;
    
    // Show metrics and improvements
    metricsSection.style.display = 'grid';
    improvementsSection.style.display = 'block';
    
    // Update metrics with animation
    updateMetrics(data);
    
    // Update improvements
    updateImprovements(data.recommendations);
  }
  
  // Update metrics with animation
  function updateMetrics(data) {
    const metricsData = {
      overallScore: data.overall.score,
      environmentalScore: data.overall.environmental,
      socialScore: data.overall.social,
      governanceScore: data.overall.governance,
      improvementAreas: data.overall.improvementAreas
    };
    
    // Animate each metric
    Object.keys(metricsData).forEach(metricId => {
      const element = document.getElementById(metricId);
      const targetValue = metricsData[metricId];
      
      animateNumber(element, 0, targetValue, 1500);
    });
  }
  
  // Animate number counting
  function animateNumber(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16); // 60fps
    let current = start;
    
    const timer = setInterval(() => {
      current += increment;
      
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        current = end;
        clearInterval(timer);
      }
      
      element.textContent = Math.floor(current);
    }, 16);
  }
  
  // Update improvements section
  function updateImprovements(recommendations) {
    const container = document.getElementById('improvementsContainer');
    
    container.innerHTML = recommendations.map(rec => `
      <div class="improvement-card ${rec.priority}">
        <div class="improvement-priority priority-${rec.priority}">
          ${rec.priority.toUpperCase()} PRIORITY
        </div>
        <h4>${rec.title}</h4>
        <p>${rec.description}</p>
      </div>
    `).join('');
  }
  
  // Add some additional improvement recommendations
  function generateAdditionalRecommendations(parameters, countries) {
    const additionalRecs = [
      {
        priority: 'medium',
        title: 'Strengthen Supply Chain Transparency',
        description: 'Implement blockchain-based tracking for better ESG compliance monitoring across the supply chain'
      },
      {
        priority: 'low',
        title: 'Enhance Stakeholder Engagement',
        description: 'Create regular forums for community feedback and incorporate stakeholder input into ESG strategy'
      },
      {
        priority: 'high',
        title: 'Accelerate Digital Transformation',
        description: 'Leverage AI and IoT technologies to optimize resource usage and reduce environmental impact'
      }
    ];
    
    return additionalRecs;
  }
  
  // Store reference for other blocks
  window.esgMetrics = {
    showMetrics: () => {
      metricsSection.style.display = 'grid';
      improvementsSection.style.display = 'block';
    },
    hideMetrics: () => {
      metricsSection.style.display = 'none';
      improvementsSection.style.display = 'none';
    },
    updateMetrics: (data) => {
      updateMetrics(data);
      updateImprovements(data.recommendations);
    }
  };
} 