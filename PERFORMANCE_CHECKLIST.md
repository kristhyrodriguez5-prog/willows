# Performance Code Review Checklist

Use this checklist when reviewing code for performance issues in the Willows shoe store application.

## Database Operations

### Queries
- [ ] No N+1 query problems (use eager loading, JOINs, or batch queries)
- [ ] Appropriate indexes exist for WHERE, JOIN, and ORDER BY clauses
- [ ] SELECT statements only retrieve needed columns (avoid SELECT *)
- [ ] Large result sets use pagination or cursor-based pagination
- [ ] Queries use connection pooling
- [ ] Prepared statements are used to prevent SQL injection and improve performance
- [ ] EXPLAIN/ANALYZE shows efficient query execution plans

### Transactions
- [ ] Transactions are kept as short as possible
- [ ] No long-running transactions that could block other operations
- [ ] Proper transaction isolation levels are used

## API Endpoints

### Request/Response
- [ ] Response payloads are appropriately sized (consider pagination)
- [ ] Gzip/Brotli compression is enabled
- [ ] Proper HTTP caching headers are set (Cache-Control, ETag)
- [ ] API versioning is implemented for breaking changes
- [ ] Rate limiting is in place to prevent abuse

### Processing
- [ ] No blocking I/O operations on the main thread
- [ ] Heavy computations are offloaded to background jobs
- [ ] Batch endpoints exist for operations that may be called multiple times
- [ ] Timeouts are configured to prevent hanging requests
- [ ] Concurrent requests are handled efficiently

## Frontend Code

### React/Vue/Angular Specific
- [ ] Components use proper memoization (useMemo, useCallback, React.memo)
- [ ] Large lists use virtualization (react-window, react-virtualized)
- [ ] State updates are batched when possible
- [ ] Effects have proper dependency arrays
- [ ] Expensive computations are memoized
- [ ] Keys are stable and unique in lists

### JavaScript/TypeScript
- [ ] Efficient data structures used (Map/Set instead of arrays for lookups)
- [ ] No unnecessary array iterations (multiple passes combined)
- [ ] Event handlers are debounced/throttled appropriately
- [ ] DOM manipulations are batched
- [ ] No synchronous localStorage/sessionStorage reads in hot paths
- [ ] Regex patterns are compiled once, not per use

### Bundle and Assets
- [ ] Code splitting is implemented for routes/features
- [ ] Lazy loading is used for below-the-fold content
- [ ] Tree shaking is enabled and working
- [ ] Bundle size is monitored and under control
- [ ] Third-party libraries are evaluated for size/performance

## Images and Media

### Optimization
- [ ] Images are compressed appropriately
- [ ] Modern formats (WebP, AVIF) are used with fallbacks
- [ ] Responsive images (srcset) are implemented
- [ ] Images use lazy loading (loading="lazy" or Intersection Observer)
- [ ] Critical images use preloading
- [ ] Sprites or icon fonts/SVGs are used for icons

### Delivery
- [ ] Static assets are served from CDN
- [ ] Appropriate cache headers are set
- [ ] Images have explicit width/height to prevent layout shift

## Caching

### Implementation
- [ ] Frequently accessed data is cached appropriately
- [ ] Cache invalidation strategy is in place
- [ ] Cache keys are well-designed and collision-free
- [ ] Cache TTL is appropriate for data freshness requirements
- [ ] Memory limits are set for in-memory caches

### Layers
- [ ] Browser caching is leveraged
- [ ] Application-level caching exists for expensive operations
- [ ] Database query results are cached when appropriate
- [ ] CDN caching is configured for static assets

## Algorithms and Data Structures

### Complexity
- [ ] Time complexity is optimal for the use case
- [ ] Space complexity is reasonable
- [ ] No nested loops that could be optimized
- [ ] Appropriate data structures chosen (hash map vs array)
- [ ] Binary search used instead of linear search where applicable

### Common Issues
- [ ] No redundant calculations in loops
- [ ] Results are cached when same input produces same output
- [ ] Early returns/exits are used to skip unnecessary work
- [ ] String concatenation uses efficient methods (StringBuilder, template literals)

## Memory Management

### Leaks Prevention
- [ ] Event listeners are properly cleaned up
- [ ] Intervals/timeouts are cleared
- [ ] Database connections are closed
- [ ] File handles are closed
- [ ] Subscriptions/observables are unsubscribed
- [ ] WeakMap/WeakSet used for caches tied to object lifecycles

### Allocation
- [ ] Large arrays/objects are not unnecessarily copied
- [ ] Object pooling is used for frequently created objects
- [ ] Closures don't capture unnecessary scope
- [ ] Large responses are streamed, not loaded into memory

## Third-Party Dependencies

### Evaluation
- [ ] Dependencies are evaluated for size and performance impact
- [ ] Lighter alternatives are considered
- [ ] Dependencies are kept up-to-date (security and performance)
- [ ] Unnecessary dependencies are removed
- [ ] Bundle analyzer is used to identify large dependencies

## Monitoring and Observability

### Instrumentation
- [ ] Critical paths have performance monitoring
- [ ] Slow operations are logged with timing
- [ ] Error rates are tracked
- [ ] Key business metrics are measured
- [ ] APM tool is configured correctly

### Alerts
- [ ] Alerts exist for performance degradation
- [ ] SLOs/SLAs are defined and monitored
- [ ] Dashboard shows key performance metrics

## Testing

### Performance Tests
- [ ] Load tests exist for critical endpoints
- [ ] Performance regression tests are in CI/CD
- [ ] Tests run with realistic data volumes
- [ ] Memory usage is tested for leaks
- [ ] Tests cover slow network conditions

## Security vs Performance

### Balance
- [ ] Security measures don't unnecessarily impact performance
- [ ] Rate limiting is in place but not overly restrictive
- [ ] Authentication/authorization is efficient
- [ ] Cryptographic operations use appropriate algorithms
- [ ] Input validation is efficient

## Code Smells for Performance

### Red Flags
- [ ] No synchronous file I/O in request handlers
- [ ] No blocking calls in async functions
- [ ] No infinite loops or recursion without termination
- [ ] No excessive logging in hot paths
- [ ] No debugging code left in production
- [ ] No hardcoded delays/sleeps used to "fix" race conditions

## Mobile Considerations

### Mobile-Specific
- [ ] Reduced payloads for mobile clients
- [ ] Offline support where appropriate
- [ ] Battery-efficient operations
- [ ] Network-aware code (adapt to connection quality)

## Documentation

### Performance Documentation
- [ ] Performance characteristics are documented
- [ ] Known limitations are documented
- [ ] Caching strategies are documented
- [ ] Performance optimization decisions are explained in comments

## Review Process

When reviewing code for performance:

1. **Measure First**: Ask for profiling data if concerned about performance
2. **Focus on Bottlenecks**: Optimize the critical path first
3. **Consider Trade-offs**: Sometimes maintainability > performance
4. **Look for Patterns**: Check if optimization applies elsewhere
5. **Test Impact**: Verify optimizations actually improve performance

## Common Optimization Opportunities

### Quick Wins
- Add database indexes
- Enable compression
- Implement caching
- Optimize images
- Add lazy loading
- Use CDN for static assets

### Medium Effort
- Implement code splitting
- Add virtualization for long lists
- Optimize bundle size
- Implement background jobs
- Add database read replicas

### High Effort
- Redesign inefficient algorithms
- Refactor architecture for scale
- Implement microservices
- Add distributed caching
- Optimize database schema

## Performance Budget

Establish and enforce performance budgets:

- [ ] Page load time < 3 seconds
- [ ] API response time p95 < 500ms
- [ ] Bundle size < 200KB (gzipped)
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals in "good" range

## Summary

✅ **Do:**
- Profile before optimizing
- Focus on user-facing performance
- Measure impact of changes
- Document performance decisions
- Consider scalability early

❌ **Don't:**
- Optimize without measuring
- Sacrifice maintainability unnecessarily
- Ignore obvious inefficiencies
- Skip performance testing
- Forget about mobile users

Remember: **Code that doesn't ship has zero performance. Balance performance with shipping velocity.**
