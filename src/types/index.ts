export type Pool = {
  asset: string,
  volume24h: string,
  assetDepth: string,
  runeDepth: string,
  assetPrice: string,
  assetPriceUSD: string,
  annualPercentageRate: string,
  poolAPY: string,
  status: string,
  liquidityUnits: string,
  synthUnits: string,
  synthSupply: string,
  units: string,
  nativeDecimal: string,
}

export type Pools = Pool[]
