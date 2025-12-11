# Quick Performance Reference Guide

A quick reference for common performance optimizations in the Willows shoe store.

## Database Queries

### N+1 Query Problem
```sql
-- ❌ Avoid
SELECT * FROM shoes;
-- Then loop: SELECT * FROM reviews WHERE shoe_id = ?

-- ✅ Use
SELECT s.*, r.* FROM shoes s LEFT JOIN reviews r ON s.id = r.shoe_id;
```

### Missing Indexes
```sql
-- ✅ Add indexes for WHERE, JOIN, ORDER BY columns
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_shoes_category ON shoes(category);
```

### Pagination
```sql
-- ✅ Always paginate large result sets
SELECT * FROM shoes LIMIT 20 OFFSET 0;
```

## JavaScript/TypeScript

### Array Operations
```javascript
// ❌ O(n²) - Nested loops
for (let i = 0; i < arr.length; i++) {
  for (let j = 0; j < arr.length; j++) { }
}

// ✅ O(n) - Use Map/Set for lookups
const map = new Map(arr.map(item => [item.id, item]));
const result = ids.map(id => map.get(id));
```

### Multiple Iterations
```javascript
// ❌ Multiple passes
const filtered = arr.filter(x => x.active);
const mapped = filtered.map(x => x.value);
const sorted = mapped.sort();

// ✅ Single pass
const result = arr
  .filter(x => x.active)
  .map(x => x.value)
  .sort();
```

### Async Operations
```javascript
// ❌ Sequential - slow
for (const id of ids) {
  await fetch(`/api/${id}`);
}

// ✅ Parallel - fast
await Promise.all(ids.map(id => fetch(`/api/${id}`)));
```

### Event Handlers
```javascript
// ❌ No debouncing
input.addEventListener('keyup', handleSearch);

// ✅ Debounced
const debouncedSearch = debounce(handleSearch, 300);
input.addEventListener('keyup', debouncedSearch);
```

### DOM Manipulation
```javascript
// ❌ Multiple reflows
for (const item of items) {
  container.appendChild(createNode(item));
}

// ✅ Single reflow
const fragment = document.createDocumentFragment();
for (const item of items) {
  fragment.appendChild(createNode(item));
}
container.appendChild(fragment);
```

## Python

### List Operations
```python
# ❌ List for lookups - O(n)
if item in my_list:
    return my_list.index(item)

# ✅ Dict/Set for lookups - O(1)
if item in my_dict:
    return my_dict[item]
```

### String Building
```python
# ❌ String concatenation - O(n²)
result = ""
for item in items:
    result += str(item)

# ✅ Join - O(n)
result = "".join(str(item) for item in items)
```

### File Processing
```python
# ❌ Load entire file - O(n) memory
with open(file) as f:
    lines = f.readlines()
    for line in lines:
        process(line)

# ✅ Stream processing - O(1) memory
with open(file) as f:
    for line in f:
        process(line)
```

### List Comprehensions
```python
# ✅ Use list comprehensions - faster
result = [x * 2 for x in items if x > 0]

# vs regular loops
result = []
for x in items:
    if x > 0:
        result.append(x * 2)
```

## Caching

### Application Cache
```javascript
// ✅ Simple in-memory cache
const cache = new Map();

function getCachedData(key, fetchFn) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = fetchFn();
  cache.set(key, data);
  return data;
}
```

### HTTP Caching
```javascript
// ✅ Set cache headers
res.setHeader('Cache-Control', 'public, max-age=3600');
res.setHeader('ETag', generateETag(content));
```

## React Performance

### Memoization
```javascript
// ✅ Memoize expensive computations
const sorted = useMemo(
  () => items.sort((a, b) => a.price - b.price),
  [items]
);

// ✅ Memoize callbacks
const handleClick = useCallback(
  () => doSomething(id),
  [id]
);

// ✅ Memoize components
const MemoizedCard = memo(Card);
```

### Virtual Lists
```javascript
// ✅ Use react-window for large lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={50}
  width="100%"
>
  {Row}
</FixedSizeList>
```

## Images

### Responsive Images
```html
<!-- ✅ Multiple sizes with lazy loading -->
<img
  srcset="small.jpg 400w, medium.jpg 800w, large.jpg 1200w"
  sizes="(max-width: 600px) 400px, 800px"
  loading="lazy"
  alt="Shoe"
/>
```

### Modern Formats
```html
<!-- ✅ WebP with fallback -->
<picture>
  <source srcset="shoe.webp" type="image/webp">
  <img src="shoe.jpg" alt="Shoe">
</picture>
```

## Bundle Size

### Code Splitting
```javascript
// ✅ Dynamic imports
const Component = lazy(() => import('./Component'));

// Route-based splitting
const routes = [
  { path: '/', component: lazy(() => import('./Home')) },
  { path: '/products', component: lazy(() => import('./Products')) }
];
```

### Tree Shaking
```javascript
// ✅ Named imports
import { specific } from 'library';

// ❌ Avoid default imports from large libraries
import _ from 'lodash'; // imports everything
```

## API Design

### Pagination
```javascript
// ✅ Implement pagination
GET /api/shoes?page=1&limit=20

// ✅ Return pagination metadata
{
  data: [...],
  pagination: {
    page: 1,
    limit: 20,
    total: 1000,
    hasMore: true
  }
}
```

### Batch Endpoints
```javascript
// ✅ Support batch operations
POST /api/shoes/batch
{ ids: [1, 2, 3, 4, 5] }

// vs multiple requests
GET /api/shoes/1
GET /api/shoes/2
...
```

### Field Selection
```javascript
// ✅ Allow field filtering
GET /api/shoes?fields=id,name,price

// Reduces payload size
```

## Monitoring

### Frontend Metrics
```javascript
// ✅ Measure performance
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: ${entry.duration}ms`);
  }
});
observer.observe({ entryTypes: ['measure', 'navigation'] });
```

### Backend Metrics
```javascript
// ✅ Track response times
const start = Date.now();
// ... do work ...
const duration = Date.now() - start;
logger.info({ endpoint, duration });
```

## Memory Management

### Event Listeners
```javascript
// ✅ Always cleanup
class Component {
  mount() {
    this.handler = () => { };
    element.addEventListener('click', this.handler);
  }
  
  unmount() {
    element.removeEventListener('click', this.handler);
  }
}
```

### Closures
```javascript
// ❌ Captures large scope
function createHandler(largeArray) {
  return () => {
    console.log(largeArray.length); // Keeps entire array
  };
}

// ✅ Capture only what's needed
function createHandler(largeArray) {
  const length = largeArray.length;
  return () => {
    console.log(length); // Only keeps number
  };
}
```

## Common Pitfalls

### ❌ Avoid These

1. **N+1 Queries** - Always use JOINs or batch queries
2. **Missing Indexes** - Add indexes for frequently queried columns
3. **Loading All Data** - Always paginate
4. **Synchronous I/O** - Use async operations
5. **No Caching** - Cache expensive operations
6. **Large Bundles** - Implement code splitting
7. **Blocking Operations** - Offload to background jobs
8. **Memory Leaks** - Clean up event listeners
9. **Unoptimized Images** - Compress and use modern formats
10. **No Monitoring** - Track performance metrics

## Performance Budget

Set and monitor these limits:

- **Page Load**: < 3 seconds on 3G
- **API Response (p95)**: < 500ms
- **Bundle Size**: < 200KB gzipped
- **Lighthouse Score**: > 90
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

## Tools

### Profiling
- **Chrome DevTools**: Performance panel, Lighthouse
- **React DevTools**: Profiler
- **Node.js**: clinic.js, 0x
- **Python**: cProfile, py-spy

### Monitoring
- **Frontend**: Web Vitals, Sentry, LogRocket
- **Backend**: New Relic, Datadog, Application Insights
- **Database**: EXPLAIN, Slow query log

### Testing
- **Load Testing**: Artillery, k6, JMeter
- **Bundle Analysis**: webpack-bundle-analyzer, source-map-explorer

## When to Optimize

✅ **Do optimize:**
- Critical user paths (checkout, search)
- Frequently accessed endpoints
- Known bottlenecks (measured)
- When metrics degrade

❌ **Don't optimize:**
- Without measuring first
- Rarely used features
- Prematurely (before it's a problem)
- At the cost of readability (unless necessary)

## Quick Checklist

Before deploying:
- [ ] Profiled critical paths
- [ ] No N+1 queries
- [ ] Appropriate indexes exist
- [ ] Images optimized
- [ ] Caching implemented
- [ ] Bundle size checked
- [ ] Load tested
- [ ] Monitoring configured

---

**Remember**: Profile first, optimize second, measure impact third.