/* eslint-disable no-console */
export default function decorate(block) {
  // Add container class
  block.classList.add('esg-parameters-block');

  // Parameter categories
  const categories = {
    Environmental: { icon: '🌍', color: 'green', params: [] },
    Social: { icon: '👥', color: 'blue', params: [] },
    Governance: { icon: '🏛️', color: 'purple', params: [] },
  };

  // Initialize selectedParams as a Set to store codes
  const selectedParams = new Set();

  // Helper function to get parameter names from codes
  function getSelectedParameterNames() {
    const paramNames = [];
    Object.values(categories).forEach((category) => {
      category.params.forEach((param) => {
        if (selectedParams.has(param.code)) {
          paramNames.push(param.name);
        }
      });
    });
    return paramNames;
  }

  // Helper function to update category counters
  function updateCategoryCounters() {
    Object.keys(categories).forEach((categoryName) => {
      const category = categories[categoryName];
      const selectedCount = category.params.filter((p) => selectedParams.has(p.code)).length;
      const totalCount = category.params.length;
      const counter = document.querySelector(`.parameter-category.${category.color} .category-count`);
      if (counter) {
        counter.textContent = `${selectedCount}/${totalCount}`;
      }
    });

    // Update overall counter
    const paramCount = document.getElementById('param-count');
    if (paramCount) {
      paramCount.textContent = selectedParams.size;
    }

    // Add/remove has-selection class
    Object.keys(categories).forEach((categoryName) => {
      const category = categories[categoryName];
      const selectedCount = category.params.filter((p) => selectedParams.has(p.code)).length;
      const categoryEl = document.querySelector(`.parameter-category.${category.color}`);
      if (categoryEl) {
        if (selectedCount > 0) {
          categoryEl.classList.add('has-selection');
        } else {
          categoryEl.classList.remove('has-selection');
        }
      }
    });
  }

  // Function to update selected parameters display
  function updateSelectedDisplay() {
    const selectedList = document.getElementById('selected-list');
    const selectedArray = Array.from(selectedParams);

    if (selectedArray.length === 0) {
      selectedList.innerHTML = '<div class="no-selection">Select parameters to begin analysis</div>';
      selectedList.parentElement.classList.remove('has-selection');
    } else {
      const paramObjects = [];
      Object.values(categories).forEach((category) => {
        category.params.forEach((param) => {
          if (selectedParams.has(param.code)) {
            paramObjects.push({ ...param, categoryColor: category.color });
          }
        });
      });

      selectedList.innerHTML = paramObjects.map((param) => `
        <div class="selected-tag ${param.categoryColor}" data-code="${param.code}">
          <span class="tag-icon">📊</span>
          <span class="tag-text">${param.name}</span>
          <button class="remove-btn" onclick="window.removeParam('${param.code}')" aria-label="Remove ${param.name}">×</button>
        </div>
      `).join('');
      selectedList.parentElement.classList.add('has-selection');
    }
  }

  // Extract parameters from table
  [...block.children].forEach((row) => {
    const cells = [...row.children];

    if (cells.length >= 2) {
      const getText = (cell) => {
        const p = cell.querySelector('p');
        return p ? p.textContent.trim() : cell.textContent.trim();
      };

      const categoryName = getText(cells[0]);
      const codeAndName = getText(cells[1]);

      if (categoryName && codeAndName && categoryName !== '---') {
        const [code, name] = codeAndName.split('|').map((s) => s.trim());

        if (code && name) {
          const param = { code, name, category: categoryName };

          if (categories[categoryName]) {
            categories[categoryName].params.push(param);
          }
        }
      }
    }
  });

  // Create the enhanced UI
  const totalParams = Object.values(categories).reduce((sum, cat) => sum + cat.params.length, 0);

  block.innerHTML = `
    <div class="parameters-header">
      <div class="header-content">
        <div class="main-title">
          <span class="title-icon">⚙️</span>
          ESG Parameters
        </div>
        <p class="subtitle">Select environmental, social, and governance indicators for comprehensive analysis</p>
        <div class="selection-indicator">
          <div class="count-badge">
            <span id="param-count">0</span>
            <span class="count-label">/ ${totalParams} selected</span>
          </div>
        </div>
      </div>
    </div>

    <div class="parameters-grid">
      ${Object.entries(categories).map(([categoryName, category]) => `
        <div class="parameter-category ${category.color}">
          <div class="category-header">
            <div class="category-icon">${category.icon}</div>
            <div class="category-info">
              <h3 class="category-title">${categoryName}</h3>
              <span class="category-count">0/${category.params.length}</span>
            </div>
          </div>
          <div class="category-content">
            ${category.params.length > 0 ? category.params.map((param) => `
              <label class="parameter-item" data-code="${param.code}" style="cursor: pointer; display: flex; align-items: center;">
                <div class="checkbox-wrapper">
                  <input type="checkbox" 
                         id="param_${param.code}" 
                         data-code="${param.code}"
                         onchange="window.handleParamChange(this)"
                         style="opacity: 0; position: absolute; width: 16px; height: 16px; cursor: pointer;">
                  <span class="checkmark" style="pointer-events: none;"></span>
                </div>
                <div class="parameter-info" style="pointer-events: none;">
                  <div class="parameter-name">${param.name}</div>
                  <div class="parameter-code">${param.code}</div>
                </div>
              </label>
            `).join('') : '<div class="empty-state"><span class="empty-icon">📊</span><p>No parameters available</p></div>'}
          </div>
        </div>
      `).join('')}
    </div>

    <div class="selection-summary">
      <div class="summary-header">
        <h3 class="summary-title">
          <span class="summary-icon">✨</span>
          Selected Parameters
        </h3>
      </div>
      <div class="selected-tags-container" id="selected-list">
        <div class="no-selection">Select parameters to begin analysis</div>
      </div>
    </div>
  `;

  // Global function to handle parameter changes (attached via onchange)
  window.handleParamChange = function handleParamChange(checkbox) {
    const { code } = checkbox.dataset;
    const paramItem = checkbox.closest('.parameter-item');

    if (checkbox.checked) {
      selectedParams.add(code);
      paramItem.classList.add('selected');
      // Add selection animation
      paramItem.style.transform = 'scale(1.02)';
      setTimeout(() => {
        paramItem.style.transform = '';
      }, 200);
    } else {
      selectedParams.delete(code);
      paramItem.classList.remove('selected');
    }

    updateCategoryCounters();
    updateSelectedDisplay();

    // Dispatch event with parameter NAMES (not codes) for World Bank API compatibility
    const selectedParameterNames = getSelectedParameterNames();
    window.dispatchEvent(new CustomEvent('esg-parameters-updated', {
      detail: { selectedParams: selectedParameterNames },
    }));

    console.log('📊 Selected parameter names for API:', selectedParameterNames);
  };

  // Global function to remove parameters (for remove buttons)
  window.removeParam = function removeParam(code) {
    const checkbox = document.querySelector(`input[data-code="${code}"]`);
    if (checkbox) {
      checkbox.checked = false;
      const paramItem = checkbox.closest('.parameter-item');
      paramItem.classList.remove('selected');

      // Add removal animation
      const tag = document.querySelector(`.selected-tag[data-code="${code}"]`);
      if (tag) {
        tag.style.transform = 'scale(0.8)';
        tag.style.opacity = '0';
        setTimeout(() => {
          selectedParams.delete(code);
          updateCategoryCounters();
          updateSelectedDisplay();

          // Dispatch event with parameter NAMES (not codes)
          const selectedParameterNames = getSelectedParameterNames();
          window.dispatchEvent(new CustomEvent('esg-parameters-updated', {
            detail: { selectedParams: selectedParameterNames },
          }));
        }, 200);
      }
    }
  };

  // Initialize counters
  setTimeout(() => {
    updateCategoryCounters();
  }, 100);
}
