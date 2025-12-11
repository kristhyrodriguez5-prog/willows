"""
Performance Optimization Examples for Python Backend

This module demonstrates common performance issues and their solutions
for the Willows shoe store backend.
"""

import time
from typing import List, Dict, Any
from functools import lru_cache
from concurrent.futures import ThreadPoolExecutor
import asyncio


# ============================================================================
# Example 1: N+1 Query Problem
# ============================================================================

class ShoeRepository:
    """Example repository showing database query optimization"""
    
    def __init__(self, db):
        """Initialize with database connection"""
        self.db = db
    
    def get_shoes_with_reviews_bad(self) -> List[Dict[str, Any]]:
        """
        ❌ BAD: N+1 Query Problem
        Executes 1 query for shoes + N queries for reviews
        Time Complexity: O(n) queries
        """
        # Simulating database queries
        shoes = self.db.execute("SELECT * FROM shoes")  # 1 query
        
        result = []
        for shoe in shoes:
            # This creates N additional queries!
            reviews = self.db.execute(
                "SELECT * FROM reviews WHERE shoe_id = ?", 
                [shoe['id']]
            )  # N queries
            shoe['reviews'] = reviews
            result.append(shoe)
        
        return result
    
    def get_shoes_with_reviews_good(self) -> List[Dict[str, Any]]:
        """
        ✅ GOOD: Using JOIN to fetch all data in one query
        Time Complexity: O(1) queries
        """
        query = """
            SELECT 
                s.id, s.name, s.price, s.image_url,
                r.id as review_id, r.rating, r.comment
            FROM shoes s
            LEFT JOIN reviews r ON s.id = r.shoe_id
        """
        rows = self.db.execute(query)  # 1 query
        
        # Group reviews by shoe
        shoes_dict = {}
        for row in rows:
            shoe_id = row['id']
            if shoe_id not in shoes_dict:
                shoes_dict[shoe_id] = {
                    'id': row['id'],
                    'name': row['name'],
                    'price': row['price'],
                    'image_url': row['image_url'],
                    'reviews': []
                }
            
            if row['review_id']:
                shoes_dict[shoe_id]['reviews'].append({
                    'id': row['review_id'],
                    'rating': row['rating'],
                    'comment': row['comment']
                })
        
        return list(shoes_dict.values())


# ============================================================================
# Example 2: Inefficient Data Processing
# ============================================================================

def filter_shoes_by_price_range_bad(shoes: List[Dict], min_price: float, max_price: float) -> List[Dict]:
    """
    ❌ BAD: Multiple iterations over the same list
    Time Complexity: O(3n) = O(n)
    """
    # First pass: filter by min price
    filtered = []
    for shoe in shoes:
        if shoe['price'] >= min_price:
            filtered.append(shoe)
    
    # Second pass: filter by max price
    result = []
    for shoe in filtered:
        if shoe['price'] <= max_price:
            result.append(shoe)
    
    # Third pass: sort
    sorted_result = []
    for shoe in sorted(result, key=lambda x: x['price']):
        sorted_result.append(shoe)
    
    return sorted_result


def filter_shoes_by_price_range_good(shoes: List[Dict], min_price: float, max_price: float) -> List[Dict]:
    """
    ✅ GOOD: Single pass with list comprehension and built-in sort
    Time Complexity: O(n + n log n) = O(n log n)
    """
    filtered = [
        shoe for shoe in shoes 
        if min_price <= shoe['price'] <= max_price
    ]
    return sorted(filtered, key=lambda x: x['price'])


# ============================================================================
# Example 3: Inefficient Search/Lookup
# ============================================================================

def find_shoes_by_sku_bad(shoes: List[Dict], target_skus: List[str]) -> List[Dict]:
    """
    ❌ BAD: Using list for lookups
    Time Complexity: O(n * m) where n = len(shoes), m = len(target_skus)
    """
    result = []
    for sku in target_skus:
        for shoe in shoes:  # Linear search for each SKU
            if shoe['sku'] == sku:
                result.append(shoe)
                break
    return result


def find_shoes_by_sku_good(shoes: List[Dict], target_skus: List[str]) -> List[Dict]:
    """
    ✅ GOOD: Using dictionary for O(1) lookups
    Time Complexity: O(n + m)
    """
    shoe_map = {shoe['sku']: shoe for shoe in shoes}  # O(n)
    result = [shoe_map[sku] for sku in target_skus if sku in shoe_map]  # O(m)
    return result


# ============================================================================
# Example 4: Caching Expensive Operations
# ============================================================================

def calculate_discount_bad(shoe_id: int, customer_tier: str) -> float:
    """
    ❌ BAD: Expensive calculation without caching
    Recalculates every time even for same inputs
    """
    # Simulate expensive operations
    time.sleep(0.1)  # Database lookup
    time.sleep(0.1)  # Complex calculation
    
    discount_rules = {
        'bronze': 0.05,
        'silver': 0.10,
        'gold': 0.15,
        'platinum': 0.20
    }
    return discount_rules.get(customer_tier, 0)


@lru_cache(maxsize=1000)
def calculate_discount_good(shoe_id: int, customer_tier: str) -> float:
    """
    ✅ GOOD: Cached expensive calculation
    Returns cached result for same inputs
    """
    # Simulate expensive operations
    time.sleep(0.1)  # Database lookup
    time.sleep(0.1)  # Complex calculation
    
    discount_rules = {
        'bronze': 0.05,
        'silver': 0.10,
        'gold': 0.15,
        'platinum': 0.20
    }
    return discount_rules.get(customer_tier, 0)


# ============================================================================
# Example 5: String Concatenation
# ============================================================================

def generate_shoe_description_bad(shoes: List[Dict]) -> str:
    """
    ❌ BAD: String concatenation in loop
    Creates new string object on each iteration
    Time Complexity: O(n²) due to string immutability
    """
    description = ""
    for shoe in shoes:
        description += f"Shoe: {shoe['name']}, Price: ${shoe['price']}\n"
    return description


def generate_shoe_description_good(shoes: List[Dict]) -> str:
    """
    ✅ GOOD: Using list and join
    Time Complexity: O(n)
    """
    lines = [f"Shoe: {shoe['name']}, Price: ${shoe['price']}" for shoe in shoes]
    return "\n".join(lines)


# ============================================================================
# Example 6: Synchronous vs Asynchronous I/O
# ============================================================================

def fetch_shoe_images_sync_bad(shoe_ids: List[int]) -> List[bytes]:
    """
    ❌ BAD: Synchronous I/O operations
    Blocks on each operation sequentially
    Time: n * operation_time
    """
    images = []
    for shoe_id in shoe_ids:
        # Simulate network request
        time.sleep(0.5)  # 500ms per request
        images.append(b"image_data")
    return images


async def fetch_shoe_images_async_good(shoe_ids: List[int]) -> List[bytes]:
    """
    ✅ GOOD: Asynchronous I/O operations
    Operations run concurrently
    Time: ~operation_time (for concurrent requests)
    """
    async def fetch_image(shoe_id: int) -> bytes:
        await asyncio.sleep(0.5)  # Simulate async network request
        return b"image_data"
    
    tasks = [fetch_image(shoe_id) for shoe_id in shoe_ids]
    images = await asyncio.gather(*tasks)
    return images


# ============================================================================
# Example 7: Database Query Optimization
# ============================================================================

class InventoryService:
    """Service demonstrating query optimization"""
    
    def __init__(self, db):
        """Initialize with database connection"""
        self.db = db
    
    def get_low_stock_shoes_bad(self) -> List[Dict]:
        """
        ❌ BAD: Loading all data then filtering in application
        Transfers unnecessary data from database
        """
        all_shoes = self.db.execute("SELECT * FROM shoes")
        
        low_stock = []
        for shoe in all_shoes:
            if shoe['stock_quantity'] < 10:
                low_stock.append(shoe)
        
        return low_stock
    
    def get_low_stock_shoes_good(self) -> List[Dict]:
        """
        ✅ GOOD: Filtering at database level
        Transfers only needed data
        """
        return self.db.execute(
            "SELECT * FROM shoes WHERE stock_quantity < 10"
        )
    
    def get_shoes_with_stats_bad(self) -> List[Dict]:
        """
        ❌ BAD: Multiple queries and in-memory aggregation
        """
        shoes = self.db.execute("SELECT * FROM shoes")
        
        for shoe in shoes:
            # Separate query for each shoe
            reviews = self.db.execute(
                "SELECT rating FROM reviews WHERE shoe_id = ?",
                [shoe['id']]
            )
            
            # Calculate average in Python
            if reviews:
                shoe['avg_rating'] = sum(r['rating'] for r in reviews) / len(reviews)
            else:
                shoe['avg_rating'] = 0
        
        return shoes
    
    def get_shoes_with_stats_good(self) -> List[Dict]:
        """
        ✅ GOOD: Single query with aggregation at database level
        """
        return self.db.execute("""
            SELECT 
                s.*,
                COALESCE(AVG(r.rating), 0) as avg_rating,
                COUNT(r.id) as review_count
            FROM shoes s
            LEFT JOIN reviews r ON s.id = r.shoe_id
            GROUP BY s.id
        """)


# ============================================================================
# Example 8: Batch Processing
# ============================================================================

def update_shoe_prices_bad(db, price_updates: List[Dict]) -> None:
    """
    ❌ BAD: Individual updates in loop
    Creates N database transactions
    
    Args:
        db: Database connection object
        price_updates: List of price updates
    """
    for update in price_updates:
        db.execute(
            "UPDATE shoes SET price = ? WHERE id = ?",
            [update['price'], update['id']]
        )
        db.commit()


def update_shoe_prices_good(db, price_updates: List[Dict]) -> None:
    """
    ✅ GOOD: Batch update in single transaction
    Creates 1 database transaction
    
    Args:
        db: Database connection object
        price_updates: List of price updates
    """
    db.begin_transaction()
    try:
        for update in price_updates:
            db.execute(
                "UPDATE shoes SET price = ? WHERE id = ?",
                [update['price'], update['id']]
            )
        db.commit()
    except Exception as e:
        db.rollback()
        raise


def update_shoe_prices_best(db, price_updates: List[Dict]) -> None:
    """
    ✅ BEST: Using bulk update with single query
    Most efficient approach
    
    Args:
        db: Database connection object
        price_updates: List of price updates
    """
    # Prepare batch data
    update_data = [(u['price'], u['id']) for u in price_updates]
    
    # Execute bulk update
    db.executemany(
        "UPDATE shoes SET price = ? WHERE id = ?",
        update_data
    )
    db.commit()


# ============================================================================
# Example 9: Memory-Efficient Processing
# ============================================================================

def process_large_inventory_bad(inventory_file: str) -> int:
    """
    ❌ BAD: Loading entire file into memory
    Memory usage: O(n) where n = file size
    """
    with open(inventory_file, 'r') as f:
        lines = f.readlines()  # Loads entire file
    
    total = 0
    for line in lines:
        total += len(line)
    
    return total


def process_large_inventory_good(inventory_file: str) -> int:
    """
    ✅ GOOD: Streaming/iterator approach
    Memory usage: O(1)
    """
    total = 0
    with open(inventory_file, 'r') as f:
        for line in f:  # Reads one line at a time
            total += len(line)
    
    return total


# ============================================================================
# Example 10: Avoiding Premature Computation
# ============================================================================

# Placeholder functions for demonstration
def get_all_shoes():
    """Placeholder: Simulate expensive database query"""
    time.sleep(0.1)  # Simulate DB query time
    return [{'id': i, 'name': f'Shoe {i}'} for i in range(100)]

def get_all_categories():
    """Placeholder: Simulate database query"""
    time.sleep(0.05)
    return ['Sneakers', 'Boots', 'Sandals']

def get_all_brands():
    """Placeholder: Simulate database query"""
    time.sleep(0.05)
    return ['Nike', 'Adidas', 'Puma']

def get_popular_shoes():
    """Placeholder: Simulate database query with analytics"""
    time.sleep(0.08)
    return [{'id': i, 'name': f'Popular {i}'} for i in range(10)]

def get_new_arrivals():
    """Placeholder: Simulate database query"""
    time.sleep(0.06)
    return [{'id': i, 'name': f'New {i}'} for i in range(20)]

def get_sale_shoes():
    """Placeholder: Simulate database query"""
    time.sleep(0.07)
    return [{'id': i, 'name': f'Sale {i}'} for i in range(15)]

def get_recommended_shoes():
    """Placeholder: Simulate expensive ML calculation"""
    time.sleep(0.5)  # ML models are expensive!
    return [{'id': i, 'name': f'Recommended {i}'} for i in range(10)]


def get_shoe_catalog_bad() -> Dict[str, Any]:
    """
    ❌ BAD: Computing all data upfront
    Wastes resources if user only needs subset
    Total time: ~0.91 seconds even if only 'shoes' is needed
    """
    return {
        'shoes': get_all_shoes(),
        'categories': get_all_categories(),
        'brands': get_all_brands(),
        'popular': get_popular_shoes(),
        'new_arrivals': get_new_arrivals(),
        'on_sale': get_sale_shoes(),
        'recommended': get_recommended_shoes()  # Expensive ML calculation
    }


def get_shoe_catalog_good(include_fields: List[str] = None) -> Dict[str, Any]:
    """
    ✅ GOOD: Lazy loading - compute only what's requested
    Only loads requested fields, saving time and resources
    """
    result = {}
    
    field_getters = {
        'shoes': get_all_shoes,
        'categories': get_all_categories,
        'brands': get_all_brands,
        'popular': get_popular_shoes,
        'new_arrivals': get_new_arrivals,
        'on_sale': get_sale_shoes,
        'recommended': get_recommended_shoes
    }
    
    for field in (include_fields or ['shoes']):
        if field in field_getters:
            result[field] = field_getters[field]()
    
    return result


# ============================================================================
# Benchmark Comparison Function
# ============================================================================

def benchmark_comparison():
    """
    Compare performance of bad vs good implementations
    """
    import time
    
    # Sample data
    shoes = [
        {'id': i, 'sku': f'SKU{i}', 'name': f'Shoe {i}', 'price': 100 + i}
        for i in range(1000)
    ]
    
    # Test 1: Price range filtering
    start = time.time()
    filter_shoes_by_price_range_bad(shoes, 100, 500)
    bad_time = time.time() - start
    
    start = time.time()
    filter_shoes_by_price_range_good(shoes, 100, 500)
    good_time = time.time() - start
    
    print(f"Price filtering - Bad: {bad_time:.4f}s, Good: {good_time:.4f}s")
    print(f"Improvement: {bad_time/good_time:.2f}x faster")
    
    # Test 2: SKU lookup
    target_skus = [f'SKU{i}' for i in range(0, 1000, 10)]
    
    start = time.time()
    find_shoes_by_sku_bad(shoes, target_skus)
    bad_time = time.time() - start
    
    start = time.time()
    find_shoes_by_sku_good(shoes, target_skus)
    good_time = time.time() - start
    
    print(f"SKU lookup - Bad: {bad_time:.4f}s, Good: {good_time:.4f}s")
    print(f"Improvement: {bad_time/good_time:.2f}x faster")


if __name__ == "__main__":
    print("Performance Optimization Examples")
    print("=" * 50)
    benchmark_comparison()
