import { ethers } from 'ethers';

const aggregatorV3InterfaceABI = [
  { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "latestRoundData", "outputs": [ { "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" } ], "stateMutability": "view", "type": "function" }
];

export async function getChainlinkPrice(
  provider: ethers.Provider,
  address: string
): Promise<number> {
  // 渡されたアドレスを正規のチェックサム形式に変換する
  const checkedAddress = ethers.getAddress(address);

  const priceFeed = new ethers.Contract(checkedAddress, aggregatorV3InterfaceABI, provider);
  const [decimals, roundData] = await Promise.all([
    priceFeed.decimals(),
    priceFeed.latestRoundData()
  ]);
  const price = Number(roundData.answer) / (10 ** Number(decimals));
  return price;
}