const HERMES_API_ENDPOINT = 'https://hermes.pyth.network';

interface PythPriceResponse {
  id: string;
  price: {
    price: string;
    conf: string;
    expo: number;
    publish_time: number;
  };
  ema_price: {
    price: string;
    conf: string;
    expo: number;
    publish_time: number;
  };
  metadata: {
    slot: number;
    proof_available_time: number;
    publisher_confidence: number;
  };
}

export async function getPythPrice(feedId: string): Promise<number> {
  const url = `${HERMES_API_ENDPOINT}/api/latest_price_feeds?ids[]=${feedId}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch from Pyth Hermes API: ${response.statusText}`);
    }
    
    const priceFeeds: PythPriceResponse[] = await response.json();
    
    if (!priceFeeds || priceFeeds.length === 0) {
      throw new Error(`Price data not found for feed ID: ${feedId}`);
    }
    
    const priceData = priceFeeds[0].price;
    const price = parseFloat(priceData.price);
    const exponent = priceData.expo;
    
    // 指数を考慮して実際の価格を計算
    const actualPrice = price * (10 ** exponent);
    
    return actualPrice;
  } catch (error) {
    console.error('Pyth API request failed:', error);
    throw error;
  }
}