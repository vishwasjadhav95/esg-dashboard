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

    // Extract parameters from table
    [...block.children].forEach((row) => {
        const cells = [...row.children];
        
        if (cells.length >= 2) {
            const getText = (cell) => {
                const p = cell.querySelector('p');
                return p ? p.textContent.trim() : cell.textContent.trim();
            };

            const category = getText(cells[0]);
            const codeAndName = getText(cells[1]);

            // Handle 2-column format where column 2 is "code|name"
            if (category && codeAndName && category !== '---' && codeAndName.includes('|')) {
                const [code, name] = codeAndName.split('|').map((s) => s.trim());

                if (code && name && categories[category]) {
                    categories[category].params.push({ code, name });
                }
            }
        }
    });

    // Helper functions
    function updateDisplay() {
        const selected = Array.from(selectedParams).map((item) => JSON.parse(item));
        const list = document.getElementById('selected-list');
        const counter = document.getElementById('param-count');

        counter.textContent = selected.length;

        if (selected.length === 0) {
            list.innerHTML = '<span class="no-selection">None selected</span>';
        } else {
            list.innerHTML = selected.map((param) => `
                <span class="selected-tag">
                    <span class="tag-icon">📊</span>
                    <span class="tag-text">${param.name}</span>
                    <button onclick="window.removeParam('${param.code}')" class="remove-btn" aria-label="Remove ${param.name}">×</button>
                </span>
            `).join('');
        }

        // Dispatch event for other blocks
        window.dispatchEvent(new CustomEvent('esg-parameters-updated', {
            detail: { parameters: selected },
        }));
    }

    // Create the enhanced layout
    block.innerHTML = `
        <div class="parameters-header">
            <div class="header-content">
                <h2 class="main-title">
                    <span class="title-icon">📊</span>
                    ESG Parameters Selection
                </h2>
                <p class="subtitle">Choose parameters you want to analyze for comprehensive ESG insights</p>
                <div class="selection-indicator">
                    <span class="count-badge">
                        <span id="param-count">0</span>
                        <span class="count-label">selected</span>
                    </span>
                </div>
            </div>
        </div>

        <div class="parameters-grid">
            ${Object.entries(categories).map(([categoryName, categoryData]) => `
                <div class="parameter-category ${categoryData.color}" data-category="${categoryName}">
                    <div class="category-header">
                        <div class="category-icon">
                            <span class="icon">${categoryData.icon}</span>
                        </div>
                        <div class="category-info">
                            <h3 class="category-title">${categoryName}</h3>
                            <span class="category-count">${categoryData.params.length} parameters</span>
                        </div>
                    </div>

                    <div class="category-content">
                        ${categoryData.params.length === 0 
                            ? '<div class="empty-state"><span class="empty-icon">📋</span><p>No parameters available</p></div>'
                            : categoryData.params.map((param) => `
                                <label class="parameter-item">
                                    <div class="checkbox-wrapper">
                                        <input type="checkbox" value="${param.code}" data-category="${categoryName}" data-name="${param.name}">
                                        <span class="checkmark"></span>
                                    </div>
                                    <div class="parameter-info">
                                        <span class="parameter-name">${param.name}</span>
                                        <span class="parameter-code">${param.code}</span>
                                    </div>
                                </label>
                            `).join('')}
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
            <div class="summary-content">
                <div id="selected-list" class="selected-tags-container">
                    <span class="no-selection">None selected</span>
                </div>
            </div>
        </div>
    `;

    // Add smooth interactivity
    const selectedParams = new Set();

    // Enhanced checkbox interactions
    block.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
        checkbox.addEventListener('change', function handleCheckboxChange() {
            const paramInfo = {
                code: this.value,
                name: this.dataset.name,
                category: this.dataset.category,
            };

            const paramItem = this.closest('.parameter-item');
            
            if (this.checked) {
                selectedParams.add(JSON.stringify(paramInfo));
                paramItem.classList.add('selected');
                // Add selection animation
                paramItem.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    paramItem.style.transform = '';
                }, 200);
            } else {
                selectedParams.delete(JSON.stringify(paramInfo));
                paramItem.classList.remove('selected');
            }

            updateDisplay();
            updateCategoryCounters();
        });

        // Add hover effects
        const paramItem = checkbox.closest('.parameter-item');
        paramItem.addEventListener('mouseenter', () => {
            if (!checkbox.checked) {
                paramItem.style.transform = 'translateX(4px)';
            }
        });

        paramItem.addEventListener('mouseleave', () => {
            if (!checkbox.checked) {
                paramItem.style.transform = '';
            }
        });
    });

    // Update category counters
    function updateCategoryCounters() {
        Object.keys(categories).forEach((categoryName) => {
            const categoryElement = block.querySelector(`[data-category="${categoryName}"]`);
            const selectedCount = categoryElement.querySelectorAll('input:checked').length;
            const totalCount = categoryElement.querySelectorAll('input').length;
            const counter = categoryElement.querySelector('.category-count');
            
            if (selectedCount > 0) {
                counter.textContent = `${selectedCount}/${totalCount} selected`;
                categoryElement.classList.add('has-selection');
            } else {
                counter.textContent = `${totalCount} parameters`;
                categoryElement.classList.remove('has-selection');
            }
        });
    }

    // Global remove function with animation
    window.removeParam = function removeParam(code) {
        const checkbox = block.querySelector(`input[value="${code}"]`);
        if (checkbox) {
            const paramItem = checkbox.closest('.parameter-item');
            
            // Add removal animation
            paramItem.style.transform = 'scale(0.95)';
            paramItem.style.opacity = '0.7';
            
            setTimeout(() => {
                checkbox.checked = false;
                checkbox.dispatchEvent(new Event('change'));
                paramItem.style.transform = '';
                paramItem.style.opacity = '';
            }, 150);
        }
    };

    // Initialize
    updateCategoryCounters();
    
    console.log(`✅ ESG Parameters initialized with ${Object.values(categories)
        .reduce((total, cat) => total + cat.params.length, 0)} parameters`);
}