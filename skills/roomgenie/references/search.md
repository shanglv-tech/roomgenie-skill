
# Search Command Reference

## Simple Search (search)

Natural-language hotel search across all accommodation types.

### Parameters

- **--city** (required): City name for hotel search
- **--keyword** (optional): Search keywords for hotel name, amenities, or nearby attractions
- **--check-in** (optional): Check-in date (`YYYY-MM-DD`)
- **--check-out** (optional): Check-out date (`YYYY-MM-DD`)

### Examples

```bash
roomgenie search --city "Beijing"
roomgenie search --city "%E4%B8%8A%E6%B5%B7" --keyword "%E4%BA%B2%E5%AD%90"
roomgenie search --city "%E6%9D%AD%E5%B7%9E" --check-in 2026-04-15 --check-out 2026-04-20
```

**CRITICAL**: Always URL-encode `--city` and `--keyword` parameters before calling the CLI. For example:
- "上海" → `"%E4%B8%8A%E6%B5%B7"`
- "亲子" → `"%E4%BA%B2%E5%AD%90"`

### Output Example

```json
{
  "data": {
    "itemList": [
      {
        "id": "hotel_001",
        "name": "Beijing Grand Hotel",
        "address": "123 Main Street, Chaoyang District, Beijing",
        "rating": 4.8,
        "reviewCount": 2345,
        "price": "¥599",
        "currency": "CNY",
        "imageUrl": "https://example.com/hotel.jpg",
        "bookingUrl": "https://example.com/book/hotel_001",
        "amenities": ["Free WiFi", "Air Conditioning", "Swimming Pool"],
        "starRating": 5,
        "distance": "2.5 km from city center"
      }
    ]
  },
  "message": "success",
  "status": 0
}
```
