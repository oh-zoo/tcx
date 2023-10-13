import {Network, XChainClient} from '@xchainjs/xchain-client'
import {Client as BitcoinClient, defaultBTCParams} from '@xchainjs/xchain-bitcoin'
// import {Client as DogeClient, defaultDogeParams} from '@xchainjs/xchain-doge'
// import {Client as EthereumClient} from '@xchainjs/xchain-ethereum'
import {Command} from '@oclif/core'

/**
 * @description Returns xchain client by chain
 * @param command this
 * @param chain string
 * @param phrase string
 * @param network Network
 * @returns XChainClient | undefined
 */
export const xchainClientByChain = ({command, chain, phrase, network = Network.Mainnet}: {command: Command, chain: string, phrase: string, network: Network}): XChainClient | undefined => {
  // switch state that returns xchain client by chain
  switch (chain) {
  case 'BTC':
    return new BitcoinClient({...defaultBTCParams, phrase, network})

  // case 'DOGE':
  //   return new DogeClient({...defaultDogeParams, phrase, network})
  }

  command.error(`No client found for chain ${chain}`)
}
