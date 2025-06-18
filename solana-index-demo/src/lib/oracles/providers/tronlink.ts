const TronWeb = require('tronweb');

type TronWebInstance = any; 

export async function getTronlinkPrice(
  tronWeb: TronWebInstance,
  address: string
): Promise<number> {
    try {
        // Base58アドレス(T...から始まる)をHexアドレス(41...から始まる)に変換
        const hexAddress = tronWeb.address.toHex(address);

        const contract = await tronWeb.contract().at(hexAddress);
        
        const [decimals, roundData] = await Promise.all([
            contract.decimals().call(),
            contract.latestRoundData().call()
        ]);

        const price = Number(roundData.answer.toString()) / (10 ** Number(decimals));
        return price;

    } catch (error) {
        console.error('TronLink price fetch failed:', error);
        throw error;
    }
}