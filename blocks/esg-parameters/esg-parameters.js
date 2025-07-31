export default function decorate(block) {
  console.log('📊 ESG Parameters - Category Cards Layout');
  
  // Add container class
  block.classList.add('esg-parameters-block');
  
  // Group parameters by category
  const categories = {
    'Environmental': { icon: '🌱', color: 'green', params: [] },
    'Social': { icon: '👥', color: 'blue', params: [] },
    'Governance': { icon: '🏛️', color: 'purple', params: [] }
  };
  
  // Extract parameters from table rows
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const getText = (cell) => {
        const p = cell.querySelector('p');
        return p ? p.textContent.trim() : cell.textContent.trim();
      };
      
      const category = getText(cells[0]);
      const paramData = getText(cells[1]);
      
      if (paramData && paramData.includes('|') && categories[category]) {
        const [code, name] = paramData.split('|').map(s => s.trim());
        if (code && name) {
          categories[category].params.push({ code, name });
          console.log(`✅ Added to ${category}: ${name}`);
        }
      }
    }
  });
  
  // Create the new layout
  block.innerHTML = `
    <div class="parameters-header">
      <h2>📊 ESG Parameters Selection</h2>
      <p>Choose parameters you want to analyze. <span id="param-count">0</span> selected.</p>
    </div>
    
    <div class="parameters-grid">
      ${Object.entries(categories).map(([categoryName, categoryData]) => `
        <div class="parameter-category ${categoryData.color}">
          <div class="category-header">
            <div class="category-icon">
              <span class="icon">${categoryData.icon}</span>
            </div>
            <h3>${categoryName}</h3>
          </div>
          
          <div class="category-content">
            ${categoryData.params.map(param => `
              <label class="parameter-item">
                <input type="checkbox" value="${param.code}" data-category="${categoryName}" data-name="${param.name}">
                <span class="parameter-name">${param.name}</span>
              </label>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
    
    <div class="selection-summary">
      <div class="summary-content">
        <strong>Selected Parameters:</strong>
        <div id="selected-list">None selected</div>
      </div>
    </div>
  `;
  
  // Add interactivity
  const selectedParams = new Set();
  
  block.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const paramInfo = {
        code: this.value,
        name: this.dataset.name,
        category: this.dataset.category
      };
      
      if (this.checked) {
        selectedParams.add(JSON.stringify(paramInfo));
        this.closest('.parameter-item').classList.add('selected');
      } else {
        selectedParams.delete(JSON.stringify(paramInfo));
        this.closest('.parameter-item').classList.remove('selected');
      }
      
      updateDisplay();
    });
  });
  
  function updateDisplay() {
    // Update count
    document.getElementById('param-count').textContent = selectedParams.size;
    
    // Update selected list
    const selectedList = document.getElementById('selected-list');
    if (selectedParams.size === 0) {
      selectedList.innerHTML = 'None selected';
    } else {
      const paramArray = Array.from(selectedParams).map(p => JSON.parse(p));
      selectedList.innerHTML = paramArray.map(param => 
        `<span class="selected-tag">${param.category}: ${param.name}</span>`
      ).join(' ');
      
      // Dispatch event for other blocks
      window.dispatchEvent(new CustomEvent('esg-parameters-updated', {
        detail: { parameters: paramArray }
      }));
    }
    
    console.log('✅ Selected parameters:', Array.from(selectedParams).map(p => JSON.parse(p)));
  }
  
  console.log(`✅ ESG Parameters: Created ${Object.values(categories).reduce((sum, cat) => sum + cat.params.length, 0)} parameter checkboxes`);
}