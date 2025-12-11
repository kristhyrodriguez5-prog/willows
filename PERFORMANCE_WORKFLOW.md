# Performance Optimization Workflow

A step-by-step guide for identifying and fixing performance issues in the Willows shoe store.

## Workflow Overview

```
1. Identify Issue → 2. Measure → 3. Analyze → 4. Optimize → 5. Test → 6. Monitor
       ↑                                                                      ↓
       └──────────────────────────────────────────────────────────────────────┘
```

## Step 1: Identify Performance Issues

### Sources of Performance Problems

**User Reports**
- Slow page loads
- Laggy interactions
- Timeouts

**Monitoring Alerts**
- High response times
- Elevated error rates
- Resource exhaustion

**Metrics Degradation**
- Lighthouse score drops
- Core Web Vitals in poor range
- Increased API latency

### Initial Triage Questions

1. **When did it start?** - Recent deployment? Traffic spike?
2. **Who's affected?** - All users? Specific region? Mobile only?
3. **What's slow?** - Specific page? API endpoint? Database query?
4. **How slow?** - Seconds? Minutes? What's the baseline?

## Step 2: Measure and Gather Data

### Frontend Measurement

**Chrome DevTools**
```javascript
// Performance panel
// 1. Open DevTools (F12)
// 2. Go to Performance tab
// 3. Click record
// 4. Perform the slow action
// 5. Stop recording
// 6. Analyze the flame graph
```

**Lighthouse**
```bash
# Command line
npm install -g lighthouse
lighthouse https://example.com --view

# Or use Chrome DevTools Lighthouse tab
```

**Web Vitals**
```javascript
import {getLCP, getFID, getCLS} from 'web-vitals';

getLCP(console.log);
getFID(console.log);
getCLS(console.log);
```

### Backend Measurement

**API Response Times**
```javascript
// Add timing middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
  });
  
  next();
});
```

**Database Query Profiling**
```sql
-- PostgreSQL
EXPLAIN ANALYZE SELECT * FROM shoes WHERE category = 'sneakers';

-- MySQL
EXPLAIN SELECT * FROM shoes WHERE category = 'sneakers';

-- Check slow query log
-- PostgreSQL: log_min_duration_statement = 1000
-- MySQL: slow_query_log = ON
```

**Application Profiling**
```python
# Python
import cProfile
cProfile.run('your_function()')

# Node.js
node --prof app.js
node --prof-process isolate-*.log > processed.txt
```

## Step 3: Analyze the Data

### Look For Common Patterns

**Database Issues**
- [ ] N+1 queries
- [ ] Missing indexes
- [ ] Full table scans
- [ ] Large result sets without pagination
- [ ] Unoptimized JOINs

**Frontend Issues**
- [ ] Large bundle size
- [ ] Unoptimized images
- [ ] Render-blocking resources
- [ ] Excessive re-renders
- [ ] Memory leaks

**Backend Issues**
- [ ] Synchronous I/O
- [ ] No caching
- [ ] Inefficient algorithms
- [ ] Blocking operations
- [ ] Resource contention

### Prioritization Matrix

```
High Impact, Easy Fix      → Do First
High Impact, Hard Fix      → Schedule Soon
Low Impact, Easy Fix       → Quick Wins
Low Impact, Hard Fix       → Backlog
```

## Step 4: Optimize

### Database Optimization

**Add Indexes**
```sql
-- Identify missing indexes
EXPLAIN ANALYZE your_query;

-- Add indexes
CREATE INDEX idx_shoes_category ON shoes(category);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
```

**Fix N+1 Queries**
```python
# Before: N+1 queries
shoes = Shoe.objects.all()
for shoe in shoes:
    reviews = shoe.reviews.all()  # Query per shoe!

# After: Single query with prefetch
shoes = Shoe.objects.prefetch_related('reviews').all()
```

**Add Pagination**
```javascript
// Before: Load all
const shoes = await db.query('SELECT * FROM shoes');

// After: Paginated
const shoes = await db.query(
  'SELECT * FROM shoes LIMIT ? OFFSET ?',
  [pageSize, offset]
);
```

### Frontend Optimization

**Code Splitting**
```javascript
// Before: Everything in main bundle
import HeavyComponent from './HeavyComponent';

// After: Lazy loaded
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

**Image Optimization**
```bash
# Compress images
npm install -g sharp-cli
sharp input.jpg -o output.jpg --quality 80

# Convert to WebP
sharp input.jpg -o output.webp
```

**Memoization**
```javascript
// Before: Recalculates every render
function Component({ items }) {
  const sorted = items.sort((a, b) => a.price - b.price);
  // ...
}

// After: Memoized
function Component({ items }) {
  const sorted = useMemo(
    () => [...items].sort((a, b) => a.price - b.price),
    [items]
  );
  // ...
}
```

### Backend Optimization

**Add Caching**
```javascript
const cache = new Map();

async function getPopularShoes() {
  const cacheKey = 'popular_shoes';
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const shoes = await db.query(
    'SELECT * FROM shoes ORDER BY sales DESC LIMIT 10'
  );
  
  cache.set(cacheKey, shoes);
  setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000); // 5 min TTL
  
  return shoes;
}
```

**Async I/O**
```javascript
// Before: Synchronous
const data = fs.readFileSync('large-file.json');

// After: Asynchronous
const data = await fs.promises.readFile('large-file.json');
```

**Batch Operations**
```javascript
// Before: Multiple requests
for (const id of shoeIds) {
  await updateShoe(id);
}

// After: Batch request
await updateShoesBatch(shoeIds);
```

## Step 5: Test the Optimization

### Verify Improvement

**Before/After Comparison**
```bash
# Measure before optimization
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost/api/shoes"

# Apply optimization

# Measure after optimization
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost/api/shoes"

# Compare results
```

**Load Testing**
```bash
# Install k6
brew install k6  # macOS
# or download from k6.io

# Create test script: load-test.js
# export default function() {
#   http.get('http://localhost/api/shoes');
# }

# Run load test
k6 run --vus 10 --duration 30s load-test.js
```

### Regression Testing

- [ ] Run existing test suite
- [ ] Verify functionality unchanged
- [ ] Check edge cases
- [ ] Test with production-like data
- [ ] Validate on different devices/browsers

## Step 6: Monitor Post-Deployment

### Deployment Checklist

- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Check performance metrics
- [ ] Deploy to production
- [ ] Monitor closely for 24-48 hours

### Monitoring Dashboard

**Key Metrics to Watch**
```javascript
{
  "frontend": {
    "lcp": "< 2.5s",
    "fid": "< 100ms",
    "cls": "< 0.1",
    "bundle_size": "< 200KB"
  },
  "backend": {
    "response_time_p95": "< 500ms",
    "error_rate": "< 1%",
    "throughput": "requests/sec"
  },
  "database": {
    "query_time_p95": "< 100ms",
    "connection_pool_usage": "< 80%",
    "slow_queries": "count"
  }
}
```

### Alert Thresholds

```yaml
# Example alert configuration
alerts:
  - name: High API Latency
    condition: p95_response_time > 1000ms
    duration: 5m
    severity: warning
    
  - name: Critical API Latency
    condition: p95_response_time > 2000ms
    duration: 2m
    severity: critical
    
  - name: High Error Rate
    condition: error_rate > 5%
    duration: 5m
    severity: critical
```

## Common Optimization Scenarios

### Scenario 1: Slow Product Search

**Symptoms:**
- Search takes 3+ seconds
- Database CPU spikes during search

**Investigation:**
```sql
EXPLAIN ANALYZE 
SELECT * FROM shoes 
WHERE name LIKE '%running%' 
OR description LIKE '%running%';
```

**Solution:**
1. Add full-text search index
2. Use proper search engine (Elasticsearch)
3. Implement caching for popular searches

### Scenario 2: Slow Page Load

**Symptoms:**
- Initial page load > 5 seconds
- Large bundle size

**Investigation:**
```bash
# Analyze bundle
npm run build
npx webpack-bundle-analyzer dist/stats.json
```

**Solution:**
1. Implement code splitting
2. Lazy load below-the-fold content
3. Optimize images
4. Enable compression

### Scenario 3: API Timeout

**Symptoms:**
- Requests timeout after 30 seconds
- High memory usage

**Investigation:**
```javascript
// Add profiling
const start = Date.now();
const result = await problematicFunction();
console.log(`Duration: ${Date.now() - start}ms`);
```

**Solution:**
1. Identify slow query/operation
2. Add pagination
3. Move to background job if > 5 seconds
4. Implement caching

## Best Practices

### Do's ✅

- **Always measure** before and after optimization
- **Profile in production-like environment**
- **Focus on user-impacting issues** first
- **Document your findings** and solutions
- **Set up monitoring** before issues occur
- **Use appropriate tools** for the job
- **Test thoroughly** before deploying

### Don'ts ❌

- **Don't optimize prematurely** without data
- **Don't sacrifice code quality** unnecessarily
- **Don't skip testing** after optimization
- **Don't ignore user feedback**
- **Don't optimize without monitoring**
- **Don't make assumptions** - measure!

## Resources

### Internal Documentation
- [Performance Guidelines](PERFORMANCE_GUIDELINES.md)
- [Performance Checklist](PERFORMANCE_CHECKLIST.md)
- [Quick Reference](QUICK_REFERENCE.md)
- [Python Examples](examples/performance_examples_python.py)
- [JavaScript Examples](examples/performance_examples_javascript.js)

### External Tools
- **Chrome DevTools**: Built-in browser profiling
- **Lighthouse**: Web performance auditing
- **k6**: Load testing
- **New Relic/Datadog**: APM solutions
- **Sentry**: Error and performance tracking

### Learning Resources
- MDN Web Performance Guide
- Google Web Fundamentals
- High Performance Browser Networking
- Database Performance Tuning guides

## Summary

Remember the golden rule of performance optimization:

> **Measure → Analyze → Optimize → Test → Monitor → Repeat**

Don't guess, measure. Don't assume, verify. Don't optimize blindly, profile first.

---

**Need help?** Check the [Quick Reference](QUICK_REFERENCE.md) for common patterns and solutions.
