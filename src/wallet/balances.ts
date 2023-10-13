import {Command} from '@oclif/core'
import {Network} from '@xchainjs/xchain-client'
import chalk from 'chalk'

import {selectChainPrompt} from '../select-chain'
import {Pools} from '../types'
import {xchainClientByChain} from './utils'

/**
 * @description Logs the balance of a given asset from the pool list
 * @param command this
 * @param phrase string
 * @param pools Pools
 * @param network Network
 * @returns Promise<void>
 */
export const balances = async ({command, network, phrase, pools}:
  {
    command: Command,
    network: Network
    phrase: string,
    pools: Pools,
  },
): Promise<void> => {
  const selectedChain = await selectChainPrompt(pools)

  const client = xchainClientByChain({chain: selectedChain, command, network, phrase})

  if (!client) {
    command.error(chalk.red(`No client found for ${selectedChain}`))
    return
  }

  const walletAddress = client?.getAddress()

  if (!walletAddress) {
    command.error(chalk.red('No wallet address found'))
    return
  }

  const walletBalances = await client.getBalance(walletAddress)
  const balance = walletBalances[0]
  const {decimal} = balance.amount

  const formattedBalance = balance.amount.amount().dividedBy(10 ** decimal)

  command.log()
  command.log(chalk.green(`${selectedChain}: ${walletAddress}: ${formattedBalance.toString()}`))
  command.log()
}
