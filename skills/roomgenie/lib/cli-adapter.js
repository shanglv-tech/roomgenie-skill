// 尝试使用新的 Node.js API
let roomgenieCLI = null;
let useNodeAPI = false;

try {
  roomgenieCLI = require('roomgenie-cli');
  useNodeAPI = true;
} catch (e) {
  console.log('roomgenie-cli npm package not found, using mock data');
  useNodeAPI = false;
}

async function searchHotels({ city, keyword, checkIn, checkOut }) {
  if (useNodeAPI && roomgenieCLI && roomgenieCLI.searchHotels) {
    try {
      // 使用新的 Node.js API
      const result = await roomgenieCLI.searchHotels({
        city,
        keyword,
        checkIn,
        checkOut
      });
      // 确保返回的数据有 priceNumeric
      if (result && result.data && result.data.itemList) {
        result.data.itemList = result.data.itemList.map(hotel => ({
          ...hotel,
          priceNumeric: hotel.priceNumeric || parsePrice(hotel.price)
        }));
      }
      return result;
    } catch (e) {
      console.error('Error calling roomgenie-cli API:', e.message);
      // 出错时回退到 mock 数据
      return getMockHotels(city);
    }
  } else {
    // 没有 npm 包时使用 mock 数据
    return getMockHotels(city);
  }
}

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const match = priceStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function getMockHotels(city) {
  const cityName = city || 'Beijing';
  return {
    data: {
      itemList: [
        {
          id: 'hotel_001',
          name: `${cityName} Grand Hotel`,
          address: `123 Main Street, ${cityName}`,
          rating: 4.8,
          reviewCount: 2345,
          price: '¥599',
          currency: 'CNY',
          priceNumeric: 599,
          imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          bookingUrl: 'https://example.com/book/hotel_001',
          amenities: ['Free WiFi', 'Air Conditioning', 'Swimming Pool'],
          starRating: 5,
          distance: '2.5 km from city center'
        },
        {
          id: 'hotel_002',
          name: `${cityName} Boutique Inn`,
          address: `456 Side Street, ${cityName}`,
          rating: 4.5,
          reviewCount: 1234,
          price: '¥399',
          currency: 'CNY',
          priceNumeric: 399,
          imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
          bookingUrl: 'https://example.com/book/hotel_002',
          amenities: ['Free WiFi', 'Air Conditioning'],
          starRating: 4,
          distance: '1.2 km from city center'
        },
        {
          id: 'hotel_003',
          name: `${cityName} Budget Stay`,
          address: `789 Budget Road, ${cityName}`,
          rating: 4.2,
          reviewCount: 876,
          price: '¥199',
          currency: 'CNY',
          priceNumeric: 199,
          imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
          bookingUrl: 'https://example.com/book/hotel_003',
          amenities: ['Free WiFi'],
          starRating: 3,
          distance: '3.8 km from city center'
        }
      ]
    },
    message: 'success',
    status: 0
  };
}

module.exports = {
  searchHotels
};
