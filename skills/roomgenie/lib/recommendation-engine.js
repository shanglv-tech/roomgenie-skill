function getHotelsFromSearchResult(result) {
  if (!result || !result.data || !result.data.itemList) {
    return [];
  }
  return result.data.itemList.map(hotel => ({
    ...hotel,
    // Ensure priceNumeric exists for sorting
    priceNumeric: hotel.priceNumeric || parsePrice(hotel.price)
  }));
}

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const match = priceStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function recommendFeatured(hotels, profile = null) {
  // Featured: high rating first, then balanced price
  return [...hotels]
    .filter(h => h.rating >= 4.0)
    .sort((a, b) => {
      const ratingDiff = b.rating - a.rating;
      if (Math.abs(ratingDiff) > 0.3) return ratingDiff;
      // Similar ratings: prefer moderate price
      const aPriceScore = Math.abs(a.priceNumeric - 400);
      const bPriceScore = Math.abs(b.priceNumeric - 400);
      return aPriceScore - bPriceScore;
    })
    .slice(0, 5);
}

function recommendDeals(hotels) {
  // Deals: low price first, but filter out low-rated
  return [...hotels]
    .filter(h => h.rating >= 4.0)
    .sort((a, b) => a.priceNumeric - b.priceNumeric)
    .slice(0, 5);
}

function recommendGeneral(hotels, profile = null) {
  // General: balance of rating, price, and review count
  return [...hotels]
    .sort((a, b) => {
      const scoreA = calculateScore(a);
      const scoreB = calculateScore(b);
      return scoreB - scoreA;
    })
    .slice(0, 5);
}

function calculateScore(hotel) {
  // Simple scoring formula: rating * 20 - price / 50 + reviewCount / 500
  const ratingScore = (hotel.rating || 0) * 20;
  const priceScore = -(hotel.priceNumeric || 0) / 50;
  const reviewScore = (hotel.reviewCount || 0) / 500;
  return ratingScore + priceScore + reviewScore;
}

function detectRecommendationIntent(userInput) {
  const input = userInput.toLowerCase();

  if (input.includes('特价') || input.includes('便宜') || input.includes('性价比') || input.includes('优惠') ||
      input.includes('deal') || input.includes('cheap') || input.includes('budget')) {
    return 'deals';
  }

  if (input.includes('精选') || input.includes('品质') || input.includes('好的') || input.includes('不错') ||
      input.includes('featured') || input.includes('quality') || input.includes('best')) {
    return 'featured';
  }

  return 'general';
}

function formatHotelsForDisplay(hotels, recommendationType = 'general') {
  return {
    type: recommendationType,
    hotels: hotels.map(h => ({
      id: h.id,
      name: h.name,
      address: h.address,
      rating: h.rating,
      reviewCount: h.reviewCount,
      price: h.price,
      imageUrl: h.imageUrl,
      bookingUrl: h.bookingUrl,
      amenities: h.amenities,
      starRating: h.starRating,
      distance: h.distance
    }))
  };
}

module.exports = {
  getHotelsFromSearchResult,
  recommendFeatured,
  recommendDeals,
  recommendGeneral,
  detectRecommendationIntent,
  formatHotelsForDisplay
};
