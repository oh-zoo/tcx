import {Command, ux} from '@oclif/core'
import {Network} from '@xchainjs/xchain-client'
import {assetAmount, assetToBase} from '@xchainjs/xchain-util'
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
export const send = async ({command, network, phrase, pools}:
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
    command.error('No client found')
    return
  }

  const fees = await client.getFees()
  const userFormattedFees = fees.average.amount().dividedBy(10 ** fees.average.decimal).toString()
  console.log('average fee amount is:', fees.average.amount().toString())

  const senderAddress = client?.getAddress()

  if (!senderAddress) {
    command.log(chalk.red('No wallet address found'))
    return
  }

  const senderBalances = await client.getBalance(senderAddress)

  const senderBalance = senderBalances[0]

  console.log('unformatted sender balance is:', senderBalance.amount.amount().toString())

  const {decimal} = senderBalance.amount

  const receiverAddress: string = (await ux.prompt(`Enter the address you would like to send your ${selectedChain}`))

  const sendAddressIsValid = client?.validateAddress(receiverAddress.trim())
  if (!sendAddressIsValid) {
    command.log(chalk.red(`Invalid ${selectedChain} address`))
    return
  }

  const sendAmount: number = Number(await ux.prompt('Enter the amount you would like to send'))

  /**
   * Ensure sendAmount is a number
   */
  // if (sendAmount.isNaN()) {
  //   command.log(chalk.red('Invalid amount'))
  //   return
  // }

  /**
   * Convert to raw amount
   * @example
   * ```ts
   * // 1 BTC = 100000000 satoshis
   * const toSend = 1 // 1 BTC
   * const btcDecimal = 8 // 8 decimal places
   * const valueInSats = assetToBase(assetAmount(toSend, btcDecimal))
   * ```
   * @link https://docs.xchainjs.org/xchain-util/how-to-use.html#convert-between-asset-and-base-vice-versa
   */
  const formattedSendAmount = assetToBase(assetAmount(sendAmount, decimal))

  /**
   * Ensure sendAmount is less than sender balance
   */
  if (formattedSendAmount.amount().plus(fees.average.amount()).isGreaterThan(senderBalance.amount.amount())) {
    command.log()
    command.log(chalk.red(`Insufficient ${selectedChain} balance`))
    command.log(chalk.red(`Your balance is ${senderBalance.amount.amount().dividedBy(10 ** decimal).toString()}`))
    command.log(chalk.red(`${selectedChain} Network fees are ${userFormattedFees}`))
    command.log(chalk.red(`You are trying to send ${sendAmount.toString()} + ${userFormattedFees}`))
    command.log()
    return
  }

  try {
    const hash = await client.transfer({amount: formattedSendAmount, recipient: receiverAddress.trim()})

    command.log()
    command.log(chalk.green.bold(`Successfully sent ${sendAmount.toString()} ${selectedChain} to ${receiverAddress.trim()}`))
    command.log(chalk.green.bold(`Transaction hash: ${hash}`))
    command.log()
  } catch {
    command.log(chalk.red('Error sending transaction'))
  }
}
