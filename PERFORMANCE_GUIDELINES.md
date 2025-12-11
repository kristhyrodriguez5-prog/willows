# Performance Optimization Guidelines

This document provides guidelines for identifying and improving slow or inefficient code in the Willows shoe store application.

## Table of Contents
1. [General Performance Principles](#general-performance-principles)
2. [Database Query Optimization](#database-query-optimization)
3. [Frontend Performance](#frontend-performance)
4. [Backend/API Optimization](#backendapi-optimization)
5. [Caching Strategies](#caching-strategies)
6. [Image and Asset Optimization](#image-and-asset-optimization)
7. [Profiling and Monitoring](#profiling-and-monitoring)

## General Performance Principles

### 1. Measure Before Optimizing
- Always profile code before optimizing
- Use metrics to identify actual bottlenecks
- Avoid premature optimization

### 2. Big O Complexity
- Aim for O(1) or O(log n) operations when possible
- Avoid nested loops (O(n²)) when alternatives exist
- Use appropriate data structures (hash maps vs arrays)

### 3. Common Anti-Patterns to Avoid
- N+1 query problems
- Synchronous operations blocking async code
- Large payloads without pagination
- Unnecessary re-rendering in UI frameworks
- Memory leaks from unclosed connections or listeners

## Database Query Optimization

### Common Issues and Solutions

#### Issue: N+1 Query Problem
```sql
-- ❌ Bad: Executes N+1 queries
SELECT * FROM shoes;
-- Then for each shoe:
SELECT * FROM reviews WHERE shoe_id = ?;

-- ✅ Good: Single query with JOIN
SELECT s.*, r.*
FROM shoes s
LEFT JOIN reviews r ON s.id = r.shoe_id;
```

#### Issue: Missing Indexes
```sql
-- ❌ Bad: Full table scan
SELECT * FROM orders WHERE customer_email = 'user@example.com';

-- ✅ Good: Add index
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
```

#### Issue: Loading Unnecessary Data
```sql
-- ❌ Bad: Loading all columns
SELECT * FROM shoes WHERE category = 'sneakers';

-- ✅ Good: Select only needed columns
SELECT id, name, price, image_url FROM shoes WHERE category = 'sneakers';
```

### Best Practices
- Use database query profiling tools (EXPLAIN in SQL)
- Implement pagination for large result sets
- Use database connection pooling
- Consider read replicas for read-heavy workloads
- Cache frequently accessed queries

## Frontend Performance

### JavaScript/TypeScript Optimization

#### Issue: Inefficient Array Operations
```javascript
// ❌ Bad: O(n²) - nested loops
function findDuplicates(shoes) {
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

// ✅ Good: O(n) - using Set
function findDuplicates(shoes) {
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
```

#### Issue: Unnecessary Re-renders (React Example)
```javascript
// ❌ Bad: Creates new object every render
function ShoeList({ shoes }) {
  const sortedShoes = shoes.sort((a, b) => a.price - b.price);
  return <div>{sortedShoes.map(shoe => <ShoeCard key={shoe.id} shoe={shoe} />)}</div>;
}

// ✅ Good: Memoized computation
import { useMemo } from 'react';

function ShoeList({ shoes }) {
  const sortedShoes = useMemo(
    () => [...shoes].sort((a, b) => a.price - b.price),
    [shoes]
  );
  return <div>{sortedShoes.map(shoe => <ShoeCard key={shoe.id} shoe={shoe} />)}</div>;
}
```

#### Issue: Blocking Main Thread
```javascript
// ❌ Bad: Blocking operation
function processLargeInventory(inventory) {
  return inventory.map(item => expensiveCalculation(item));
}

// ✅ Good: Use Web Workers or chunk processing
async function processLargeInventory(inventory) {
  const chunkSize = 100;
  const results = [];
  
  for (let i = 0; i < inventory.length; i += chunkSize) {
    const chunk = inventory.slice(i, i + chunkSize);
    results.push(...chunk.map(item => expensiveCalculation(item)));
    
    // Allow UI to breathe
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  return results;
}
```

### Bundle Optimization
- Code splitting and lazy loading
- Tree shaking unused code
- Minification and compression
- Use CDN for third-party libraries

## Backend/API Optimization

### Issue: Synchronous File Operations
```javascript
// ❌ Bad: Blocking I/O
const fs = require('fs');

function getShoeImage(shoeId) {
  const data = fs.readFileSync(`/images/${shoeId}.jpg`);
  return data;
}

// ✅ Good: Async I/O
const fs = require('fs').promises;

async function getShoeImage(shoeId) {
  const data = await fs.readFile(`/images/${shoeId}.jpg`);
  return data;
}
```

### Issue: No Request Batching
```javascript
// ❌ Bad: Multiple API calls
async function loadShoeDetails(shoeIds) {
  const shoes = [];
  for (const id of shoeIds) {
    const shoe = await fetch(`/api/shoes/${id}`);
    shoes.push(await shoe.json());
  }
  return shoes;
}

// ✅ Good: Batch request
async function loadShoeDetails(shoeIds) {
  const response = await fetch(`/api/shoes/batch`, {
    method: 'POST',
    body: JSON.stringify({ ids: shoeIds })
  });
  return await response.json();
}
```

### Issue: Missing Rate Limiting
```javascript
// ✅ Implement rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Caching Strategies

### Levels of Caching

1. **Browser Caching**
   - Set appropriate Cache-Control headers
   - Use ETags for validation
   - Service Workers for offline capability

2. **Application-Level Caching**
```javascript
// In-memory cache example
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

async function getPopularShoes() {
  const cacheKey = 'popular_shoes';
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const shoes = await db.query('SELECT * FROM shoes ORDER BY sales DESC LIMIT 10');
  cache.set(cacheKey, shoes);
  
  return shoes;
}
```

3. **CDN Caching**
   - Static assets (images, CSS, JS)
   - Cache invalidation strategy

4. **Database Query Caching**
   - Redis for session storage and hot data
   - Memcached for simple key-value caching

## Image and Asset Optimization

### Best Practices
- Use modern image formats (WebP, AVIF)
- Implement responsive images with srcset
- Lazy load images below the fold
- Compress images appropriately
- Use image CDN with automatic optimization

```html
<!-- ✅ Good: Responsive lazy-loaded image -->
<img
  src="shoe-small.jpg"
  srcset="shoe-small.jpg 400w, shoe-medium.jpg 800w, shoe-large.jpg 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  loading="lazy"
  alt="Running shoe"
/>
```

## Profiling and Monitoring

### Tools and Techniques

#### JavaScript Profiling
- Chrome DevTools Performance panel
- Lighthouse for web vitals
- React DevTools Profiler

#### Backend Profiling
- Node.js: `clinic.js`, `0x`
- Python: `cProfile`, `py-spy`
- Java: JProfiler, VisualVM
- Go: pprof

#### Database Profiling
- SQL EXPLAIN plans
- Slow query logs
- Database monitoring tools (pgAdmin, MySQL Workbench)

#### Application Performance Monitoring (APM)
- New Relic
- Datadog
- Application Insights
- Sentry for error tracking

### Key Metrics to Track

1. **Frontend Metrics**
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Time to Interactive (TTI)
   - Cumulative Layout Shift (CLS)

2. **Backend Metrics**
   - Response time (p50, p95, p99)
   - Throughput (requests per second)
   - Error rate
   - Database query time

3. **Business Metrics**
   - Page load time impact on conversion
   - Cart abandonment rate
   - Search response time

## Performance Checklist

### Before Deploying New Features

- [ ] Profile code in production-like environment
- [ ] Run load tests for API endpoints
- [ ] Check bundle size impact
- [ ] Verify database queries are optimized (no N+1 queries)
- [ ] Ensure proper caching headers are set
- [ ] Test on slow network connections (3G)
- [ ] Verify images are optimized
- [ ] Check for memory leaks
- [ ] Review error rates and timeouts
- [ ] Test with realistic data volumes

### Regular Performance Audits

- [ ] Run Lighthouse audits weekly
- [ ] Review slow query logs monthly
- [ ] Monitor Core Web Vitals
- [ ] Analyze bundle size trends
- [ ] Review and update caching strategies
- [ ] Check CDN hit rates
- [ ] Monitor server resource usage
- [ ] Review and optimize top API endpoints

## Language-Specific Optimization Tips

### Python
- Use list comprehensions instead of loops
- Leverage generators for large datasets
- Use `__slots__` for classes with many instances
- Profile with cProfile and optimize hot paths

### JavaScript/TypeScript
- Debounce/throttle frequent events
- Use requestAnimationFrame for animations
- Avoid memory leaks with proper cleanup
- Use WeakMap/WeakSet for caching

### Java
- Use StringBuilder for string concatenation
- Implement object pooling for frequently created objects
- Use concurrent collections for multithreaded access
- Profile with JProfiler

### Go
- Use goroutines but avoid goroutine leaks
- Buffer channels appropriately
- Use sync.Pool for frequently allocated objects
- Profile with pprof

## Conclusion

Performance optimization is an ongoing process. Focus on:
1. Measuring and monitoring performance metrics
2. Identifying and fixing the biggest bottlenecks first
3. Testing optimizations thoroughly
4. Maintaining performance awareness in code reviews

Remember: **Premature optimization is the root of all evil, but measured optimization is the key to success.**
