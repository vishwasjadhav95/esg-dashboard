/* eslint-disable no-console */
export default function decorate(block) {
  console.log('🔬 ESG Analysis - 4-Card Horizontal Layout');

  // Add container class
  block.classList.add('esg-analysis-block');

  // Extract analysis types from table
  const analysisTypes = [];
  let selectedAnalysis = null;

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 4) {
      const getText = (cell) => {
        const p = cell.querySelector('p');
        return p ? p.textContent.trim() : cell.textContent.trim();
      };

      const code = getText(cells[0]);
      const name = getText(cells[1]);
      const description = getText(cells[2]);
      const isDefault = getText(cells[3]).toLowerCase() === 'true';

      if (code && name && code !== '---') {
        analysisTypes.push({
          code,
          name,
          description,
          isDefault,
        });
        if (isDefault) selectedAnalysis = { code, name, description };
        console.log(`✅ Added analysis type: ${name} (default: ${isDefault})`);
      }
    }
  });

  // Create the new card layout (without actions section)
  block.innerHTML = `
    <div class="analysis-header">
      <h2>🔬 Analysis Configuration</h2>
    </div>

    <div class="analysis-cards">
      ${analysisTypes.map((analysis) => {
    // Extract icon from name (first part before space)
    const iconAndName = analysis.name.split(' ');
    const icon = iconAndName[0];
    const displayName = iconAndName.slice(1).join(' ');

    return `
          <div class="analysis-card ${analysis.isDefault ? 'selected' : ''}" data-code="${analysis.code}">
            <div class="card-content">
              <div class="analysis-icon">${icon}</div>
              <h3>${displayName}</h3>
              <p>${analysis.description}</p>
            </div>
          </div>
        `;
  }).join('')}
    </div>
  `;

  // Add interactivity to cards only
  block.querySelectorAll('.analysis-card').forEach((card) => {
    card.addEventListener('click', function handleCardClick() {
      // Remove selected from all cards
      block.querySelectorAll('.analysis-card').forEach((c) => c.classList.remove('selected'));

      // Select this card
      this.classList.add('selected');

      // Update selected analysis
      const { code } = this.dataset;
      selectedAnalysis = analysisTypes.find((a) => a.code === code);

      // Store globally for dashboard to read
      window.selectedAnalysisType = selectedAnalysis;

      // Dispatch event for other blocks
      window.dispatchEvent(new CustomEvent('esg-analysis-type-updated', {
        detail: { analysisType: selectedAnalysis },
      }));

      console.log('✅ Analysis type selected:', selectedAnalysis.name);
    });
  });

  // Set initial global variable
  if (selectedAnalysis) {
    window.selectedAnalysisType = selectedAnalysis;
  }

  console.log(`✅ ESG Analysis: ${analysisTypes.length} analysis cards created`);
}
