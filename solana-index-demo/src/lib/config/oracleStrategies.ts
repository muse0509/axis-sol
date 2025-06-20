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
      { type: 'pyth', feedId: '0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221' },
    ],
    'BNB': [
      { type: 'chainlink', chain: 'bsc', address: '0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE' },
      { type: 'pyth', feedId: '0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f' },
    ],
    'SOL': [
      { type: 'pyth', feedId: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d' },
    ],
    'DOGE': [
      { type: 'chainlink', chain: 'bsc', address: '0x3AB0A0d137D4F946fBB19eecc6e92E64660231C8' },
      { type: 'pyth', feedId: '0xdcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c' },
    ],
    'TRX': [
      { type: 'tronlink', chain: 'tron', address: 'TC6o8AakUg4Xz9nHY9qXpJNsgF7CQkwBqF' },
      { type: 'pyth', feedId: '0x67aed5a24fdad045475e7195c98a98aea119c763f272d4523f5bac93a4f33c2b' },
    ],
    'ADA': [
      { type: 'pyth', feedId: '0x2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d' },
      { type: 'chainlink', chain: 'bsc', address: '0xa767f745331D267c7751297D982b050c93985627' },
    ],
    'SUI': [
      { type: 'pyth', feedId: '0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744' },
    ],
    'AVAX': [
      { type: 'chainlink', chain: 'avalanche', address: '0x0A77230d17318075983913bC2145DB16C7366156' },
      { type: 'pyth', feedId: '0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7' },
    ],
  };
  
  export const INDEX_ASSETS = ['BTC', 'ETH', 'LINK', 'BNB', 'SOL', 'DOGE', 'TRX', 'ADA', 'SUI', 'AVAX'];