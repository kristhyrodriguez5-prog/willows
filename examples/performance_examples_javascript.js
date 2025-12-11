/**
 * Performance Optimization Examples for JavaScript/TypeScript Frontend
 * 
 * This module demonstrates common performance issues and their solutions
 * for the Willows shoe store frontend.
 */

// ============================================================================
// Example 1: Inefficient Array Operations
// ============================================================================

/**
 * ❌ BAD: Nested loops - O(n²)
 * Extremely slow for large arrays
 */
function findDuplicateShoesBad(shoes) {
  const duplicates = [];
  for (let i = 0; i < shoes.length; i++) {
    for (let j = i + 1; j < shoes.length; j++) {
      if (shoes[i].sku === shoes[j].sku) {
        duplicates.push(shoes[i]);
      }
    }
  }
  return duplicates;
}

/**
 * ✅ GOOD: Using Set for O(n) complexity
 * Much faster for large arrays
 */
function findDuplicateShoesGood(shoes) {
  const seen = new Set();
  const duplicates = new Set();
  
  shoes.forEach(shoe => {
    if (seen.has(shoe.sku)) {
      duplicates.add(shoe);
    }
    seen.add(shoe.sku);
  });
  
  return Array.from(duplicates);
}

// ============================================================================
// Example 2: Multiple Array Iterations
// ============================================================================

/**
 * ❌ BAD: Multiple passes over the array
 * Time Complexity: O(3n)
 */
function processShoesBad(shoes) {
  // First pass: filter
  const inStock = shoes.filter(shoe => shoe.stock > 0);
  
  // Second pass: map
  const withDiscount = inStock.map(shoe => ({
    ...shoe,
    discountedPrice: shoe.price * 0.9
  }));
  
  // Third pass: sort
  const sorted = withDiscount.sort((a, b) => a.price - b.price);
  
  return sorted;
}

/**
 * ✅ GOOD: Single pass with reduce
 * Time Complexity: O(n log n) - sorting dominates
 */
function processShoesGood(shoes) {
  return shoes
    .reduce((acc, shoe) => {
      if (shoe.stock > 0) {
        acc.push({
          ...shoe,
          discountedPrice: shoe.price * 0.9
        });
      }
      return acc;
    }, [])
    .sort((a, b) => a.price - b.price);
}

// ============================================================================
// Example 3: Object Lookup Performance
// ============================================================================

/**
 * ❌ BAD: Using array for lookups
 * Time Complexity: O(n) for each lookup
 */
function getShoesByIdsBad(shoes, ids) {
  return ids.map(id => shoes.find(shoe => shoe.id === id));
}

/**
 * ✅ GOOD: Using Map for O(1) lookups
 * Time Complexity: O(n + m)
 */
function getShoesByIdsGood(shoes, ids) {
  const shoeMap = new Map(shoes.map(shoe => [shoe.id, shoe]));
  return ids.map(id => shoeMap.get(id)).filter(Boolean);
}

// ============================================================================
// Example 4: DOM Manipulation
// ============================================================================

/**
 * ❌ BAD: Multiple DOM manipulations
 * Causes multiple reflows and repaints
 */
function renderShoeListBad(shoes) {
  const container = document.getElementById('shoe-list');
  
  shoes.forEach(shoe => {
    const div = document.createElement('div');
    div.className = 'shoe-card';
    div.innerHTML = `
      <h3>${shoe.name}</h3>
      <p>$${shoe.price}</p>
    `;
    container.appendChild(div); // DOM manipulation in loop!
  });
}

/**
 * ✅ GOOD: Batch DOM manipulation
 * Single reflow and repaint
 */
function renderShoeListGood(shoes) {
  const container = document.getElementById('shoe-list');
  const fragment = document.createDocumentFragment();
  
  shoes.forEach(shoe => {
    const div = document.createElement('div');
    div.className = 'shoe-card';
    div.innerHTML = `
      <h3>${shoe.name}</h3>
      <p>$${shoe.price}</p>
    `;
    fragment.appendChild(div);
  });
  
  container.appendChild(fragment); // Single DOM operation
}

// ============================================================================
// Example 5: Debouncing and Throttling
// ============================================================================

/**
 * ❌ BAD: No debouncing for search
 * Makes API call on every keystroke
 * Also missing URL encoding for query parameter
 */
function handleSearchBad(event) {
  const query = event.target.value;
  fetch(`/api/shoes/search?q=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(results => displayResults(results));
}

/**
 * ✅ GOOD: Debounced search
 * Waits for user to stop typing
 * Properly encodes query parameter
 */
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

const handleSearchGood = debounce((event) => {
  const query = event.target.value;
  fetch(`/api/shoes/search?q=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(results => displayResults(results));
}, 300);

// ============================================================================
// Example 6: Memory Leaks - Event Listeners
// ============================================================================

/**
 * ❌ BAD: Event listener not removed
 * Causes memory leak
 */
class ShoeCardBad {
  constructor(shoe) {
    this.shoe = shoe;
    this.element = this.render();
    
    this.handleClick = () => {
      console.log('Clicked:', this.shoe.name);
    };
    
    this.element.addEventListener('click', this.handleClick);
  }
  
  render() {
    const div = document.createElement('div');
    div.innerHTML = `<h3>${this.shoe.name}</h3>`;
    return div;
  }
  
  // No cleanup method!
}

/**
 * ✅ GOOD: Proper cleanup
 * Prevents memory leak
 */
class ShoeCardGood {
  constructor(shoe) {
    this.shoe = shoe;
    this.element = this.render();
    
    this.handleClick = () => {
      console.log('Clicked:', this.shoe.name);
    };
    
    this.element.addEventListener('click', this.handleClick);
  }
  
  render() {
    const div = document.createElement('div');
    div.innerHTML = `<h3>${this.shoe.name}</h3>`;
    return div;
  }
  
  destroy() {
    this.element.removeEventListener('click', this.handleClick);
    this.element = null;
  }
}

// ============================================================================
// Example 7: Async/Await and Promise Optimization
// ============================================================================

/**
 * ❌ BAD: Sequential async operations
 * Takes n * operation_time
 */
async function loadShoeDetailsBad(shoeIds) {
  const shoes = [];
  for (const id of shoeIds) {
    const response = await fetch(`/api/shoes/${id}`);
    const shoe = await response.json();
    shoes.push(shoe);
  }
  return shoes;
}

/**
 * ✅ GOOD: Parallel async operations
 * Takes ~operation_time (concurrent)
 */
async function loadShoeDetailsGood(shoeIds) {
  const promises = shoeIds.map(id =>
    fetch(`/api/shoes/${id}`).then(r => r.json())
  );
  return Promise.all(promises);
}

/**
 * ✅ BEST: Batch API endpoint
 * Single network request
 */
async function loadShoeDetailsBest(shoeIds) {
  const response = await fetch('/api/shoes/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids: shoeIds })
  });
  return response.json();
}

// ============================================================================
// Example 8: Caching with Memoization
// ============================================================================

/**
 * ❌ BAD: Recalculates every time
 * Expensive for repeated calls
 */
function calculateShippingCostBad(shoe, country) {
  // Simulate expensive calculation
  let cost = shoe.weight * 5;
  
  const countryRates = {
    'US': 1.0,
    'CA': 1.2,
    'UK': 1.5,
    'AU': 2.0
  };
  
  cost *= countryRates[country] || 1.0;
  
  return cost;
}

/**
 * ✅ GOOD: Memoized calculation
 * Caches results for repeated calls
 */
const calculateShippingCostGood = (() => {
  const cache = new Map();
  
  return function(shoe, country) {
    const key = `${shoe.id}-${country}`;
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    let cost = shoe.weight * 5;
    
    const countryRates = {
      'US': 1.0,
      'CA': 1.2,
      'UK': 1.5,
      'AU': 2.0
    };
    
    cost *= countryRates[country] || 1.0;
    
    cache.set(key, cost);
    return cost;
  };
})();

// ============================================================================
// Example 9: String Building
// ============================================================================

/**
 * ❌ BAD: String concatenation in loop
 * Creates new string on each iteration
 */
function generateShoeHTMLBad(shoes) {
  let html = '';
  
  shoes.forEach(shoe => {
    html += `<div class="shoe">`;
    html += `  <h3>${shoe.name}</h3>`;
    html += `  <p>$${shoe.price}</p>`;
    html += `</div>`;
  });
  
  return html;
}

/**
 * ✅ GOOD: Array join
 * More efficient memory usage
 */
function generateShoeHTMLGood(shoes) {
  const parts = shoes.map(shoe => `
    <div class="shoe">
      <h3>${shoe.name}</h3>
      <p>$${shoe.price}</p>
    </div>
  `);
  
  return parts.join('');
}

// ============================================================================
// Example 10: React Performance (if using React)
// ============================================================================

/**
 * ❌ BAD: Unnecessary re-renders
 * Component re-renders on every parent render
 */
/*
function ShoeListBad({ shoes }) {
  // This sorts on every render!
  const sortedShoes = shoes.sort((a, b) => a.price - b.price);
  
  return (
    <div>
      {sortedShoes.map(shoe => (
        <ShoeCard key={shoe.id} shoe={shoe} />
      ))}
    </div>
  );
}
*/

/**
 * ✅ GOOD: Memoized computation
 * Only recomputes when shoes change
 */
/*
import { useMemo } from 'react';

function ShoeListGood({ shoes }) {
  const sortedShoes = useMemo(
    () => [...shoes].sort((a, b) => a.price - b.price),
    [shoes]
  );
  
  return (
    <div>
      {sortedShoes.map(shoe => (
        <ShoeCard key={shoe.id} shoe={shoe} />
      ))}
    </div>
  );
}
*/

/**
 * ✅ GOOD: Memoized component
 * Prevents unnecessary re-renders
 */
/*
import { memo } from 'react';

const ShoeCard = memo(({ shoe }) => {
  return (
    <div className="shoe-card">
      <h3>{shoe.name}</h3>
      <p>${shoe.price}</p>
    </div>
  );
});
*/

// ============================================================================
// Example 11: Virtual Scrolling for Large Lists
// ============================================================================

/**
 * ❌ BAD: Rendering all items at once
 * Slow for large lists (1000+ items)
 */
function renderAllShoesBad(shoes) {
  const container = document.getElementById('shoe-list');
  
  shoes.forEach(shoe => {
    const div = document.createElement('div');
    div.className = 'shoe-item';
    div.textContent = shoe.name;
    container.appendChild(div);
  });
}

/**
 * ✅ GOOD: Virtual scrolling (simplified concept)
 * Only renders visible items
 */
class VirtualList {
  constructor(container, items, itemHeight) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight);
    this.startIndex = 0;
    
    this.setupScrollListener();
    this.render();
  }
  
  setupScrollListener() {
    this.container.addEventListener('scroll', () => {
      const scrollTop = this.container.scrollTop;
      const newStartIndex = Math.floor(scrollTop / this.itemHeight);
      
      if (newStartIndex !== this.startIndex) {
        this.startIndex = newStartIndex;
        this.render();
      }
    });
  }
  
  render() {
    const endIndex = Math.min(
      this.startIndex + this.visibleCount + 1,
      this.items.length
    );
    
    this.container.innerHTML = '';
    
    // Spacer for scrollbar
    const topSpacer = document.createElement('div');
    topSpacer.style.height = `${this.startIndex * this.itemHeight}px`;
    this.container.appendChild(topSpacer);
    
    // Render visible items only
    for (let i = this.startIndex; i < endIndex; i++) {
      const div = document.createElement('div');
      div.className = 'shoe-item';
      div.style.height = `${this.itemHeight}px`;
      div.textContent = this.items[i].name;
      this.container.appendChild(div);
    }
    
    // Bottom spacer
    const bottomSpacer = document.createElement('div');
    bottomSpacer.style.height = `${
      (this.items.length - endIndex) * this.itemHeight
    }px`;
    this.container.appendChild(bottomSpacer);
  }
}

// ============================================================================
// Example 12: Image Lazy Loading
// ============================================================================

/**
 * ❌ BAD: Load all images at once
 * Slows down initial page load
 */
function loadAllImagesNow(shoes) {
  return shoes.map(shoe => `
    <img src="${shoe.imageUrl}" alt="${shoe.name}" />
  `).join('');
}

/**
 * ✅ GOOD: Lazy load images with Intersection Observer
 * Images load only when visible
 */
class LazyImageLoader {
  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            this.observer.unobserve(img);
          }
        });
      },
      { rootMargin: '50px' }
    );
  }
  
  observe(images) {
    images.forEach(img => this.observer.observe(img));
  }
}

// Usage
function createLazyImage(shoe) {
  return `
    <img 
      class="lazy" 
      data-src="${shoe.imageUrl}" 
      alt="${shoe.name}"
      src="placeholder.jpg"
    />
  `;
}

// ============================================================================
// Benchmark Utilities
// ============================================================================

/**
 * Simple benchmark utility
 */
function benchmark(name, fn, iterations = 1000) {
  const start = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  
  const end = performance.now();
  const time = end - start;
  
  console.log(`${name}: ${time.toFixed(2)}ms (${(time/iterations).toFixed(4)}ms per iteration)`);
  
  return time;
}

/**
 * Compare two implementations
 */
function compare(badFn, goodFn, data, name) {
  console.log(`\n=== ${name} ===`);
  
  const badTime = benchmark('Bad', () => badFn(data), 100);
  const goodTime = benchmark('Good', () => goodFn(data), 100);
  
  const improvement = (badTime / goodTime).toFixed(2);
  console.log(`Improvement: ${improvement}x faster`);
}

// ============================================================================
// Example Usage
// ============================================================================

// Sample data for testing
const sampleShoes = Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  sku: `SKU${i}`,
  name: `Shoe ${i}`,
  price: 50 + Math.random() * 150,
  stock: Math.floor(Math.random() * 100),
  weight: 1 + Math.random() * 3
}));

// Run comparisons
if (typeof window === 'undefined') {
  // Node.js environment
  console.log('Performance Comparison Examples\n');
  
  compare(
    (shoes) => findDuplicateShoesBad(shoes.slice(0, 100)),
    (shoes) => findDuplicateShoesGood(shoes.slice(0, 100)),
    sampleShoes,
    'Finding Duplicates'
  );
  
  compare(
    (shoes) => getShoesByIdsBad(shoes, [1, 50, 100, 500, 999]),
    (shoes) => getShoesByIdsGood(shoes, [1, 50, 100, 500, 999]),
    sampleShoes,
    'Lookup by IDs'
  );
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    findDuplicateShoesGood,
    processShoesGood,
    getShoesByIdsGood,
    renderShoeListGood,
    handleSearchGood,
    loadShoeDetailsGood,
    calculateShippingCostGood,
    generateShoeHTMLGood,
    VirtualList,
    LazyImageLoader,
    benchmark,
    compare
  };
}
