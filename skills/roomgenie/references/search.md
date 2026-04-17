
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
# 中文城市名直接使用
roomgenie search --city "北京"

# 带关键词搜索
roomgenie search --city "上海" --keyword "亲子"

# 带日期范围
roomgenie search --city "杭州" --check-in 2026-04-15 --check-out 2026-04-20

# 英文城市名同样支持
roomgenie search --city "Beijing"
roomgenie search --city "Tokyo" --keyword "shibuya"
```

### Output Example

```json
{
  "data": {
    "itemList": [
      {
        "id": "hotel_1283151",
        "name": "上海临港美爵酒店",
        "address": "上海",
        "rating": 4.7,
        "reviewCount": 551,
        "price": "¥400",
        "currency": "CNY",
        "imageUrl": "https://p1.zmjiudian.com/120EOXM1Ok_350X350",
        "bookingUrl": "",
        "amenities": ["健身房", "室内泳池", "近景点", "近商场"],
        "starRating": 0,
        "distance": ""
      }
    ]
  },
  "message": "success",
  "status": 0
}
```

### Important Notes

- **Chinese parameters**: Chinese city names and keywords are supported directly - no URL-encoding needed
- **UTF-8 native**: Node.js + Commander.js natively handle UTF-8 command line arguments
- **Date format**: Always use `YYYY-MM-DD` format for check-in/check-out dates
