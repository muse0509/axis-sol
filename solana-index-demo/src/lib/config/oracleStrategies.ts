export interface PriceStrategy {
    type: 'chainlink' | 'pyth' | 'tronlink';
    chain?: 'ethereum' | 'bsc' | 'avalanche' | 'tron';
    address?: string; 
    feedId?: string;
  }
  
  export const ASSET_PRICE_STRATEGIES: Record<string, PriceStrategy[]> = {
    'BTC': [
      { type: 'chainlink', chain: 'ethereum', address: '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c' },
      { type: 'pyth', feedId: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43' },
    ],
    'ETH': [
      { type: 'chainlink', chain: 'ethereum', address: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419' },
      { type: 'pyth', feedId: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace' },
    ],
    'LINK': [
      { type: 'chainlink', chain: 'ethereum', address: '0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c' },
      { type: 'pyth', feedId: '0x8ac0c70fff57e9a9bf352b2f02660638e3b1c3e1072a79BCBE728e5786a3949f' },
    ],
    'BNB': [
      { type: 'chainlink', chain: 'bsc', address: '0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE' },
      { type: 'pyth', feedId: '0x42b89e7a451512b79a78a639b7b91314b9a7a974df83437637a2a1975b364e03' },
    ],
    'SOL': [
      { type: 'pyth', feedId: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d' },
    ],
    'DOGE': [
      { type: 'chainlink', chain: 'bsc', address: '0x106518F2A1B65541A113702a45a87242139A5D7E' },
      { type: 'pyth', feedId: '0xf7b76a543e11417253509b53f34589f21e5a593e8784d53894b5951e44f80145' },
    ],
    'TRX': [
      { type: 'tronlink', chain: 'tron', address: 'TX2f1n5atQp29sjbF5w3bdo8p1nLgT28pS' },
      { type: 'pyth', feedId: '0x76a26400a2955e09f579a321d5828373a1197305943b1418706c9e133e9d4a8e' },
    ],
    'ADA': [
      { type: 'pyth', feedId: '0x3d1a0b3f17d363958f8e02b3f2c525883584aff1c5653b8175317e174112e5cb' },
      { type: 'chainlink', chain: 'bsc', address: '0x2A1264662b6aD55D40CAcc2403975736f1571344' },
    ],
    'SUI': [
      { type: 'pyth', feedId: '0x23d72a553a3399990a44a67f62c040337f7a221f55979577908b981c2f62bd49' },
    ],
    'AVAX': [
      { type: 'chainlink', chain: 'avalanche', address: '0x0A77230d17318075983913bC2145DB16C7366156' },
      { type: 'pyth', feedId: '0x992ab2a5d2e5a7b7a2d8442a8a1a2b0e9a5ef3180210e30b6910a30b616440f' },
    ],
  };
  
  export const INDEX_ASSETS = ['BTC', 'ETH', 'LINK', 'BNB', 'SOL', 'DOGE', 'TRX', 'ADA', 'SUI', 'AVAX'];