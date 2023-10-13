import {Command, Flags} from '@oclif/core'
import {Network} from '@xchainjs/xchain-client'
import {validatePhrase} from '@xchainjs/xchain-crypto'
import chalk from 'chalk';
import inquirer from 'inquirer';
import {clear} from 'node:console'

import {fetchPools} from '../../fetch-pools'
import {Pool, Pools} from '../../types'
import { balances, connect, create, phrase as logPhrase, receive, send } from '../../wallet'

export default class Root extends Command {
	static description = 'Say hello'

	static examples = [
		`$ oex hello friend --from oclif
hello friend from oclif! (./src/commands/hello/index.ts)
`,
	]

	static flags = {
		network: Flags.string({
			char: 'n',
			description: 'Select Network',
			options: ['testnet', 'mainnet'],
		}),
	}

	// static flags = {
	//   from: Flags.string({char: 'f', description: 'Who is saying hello', required: true}),
	// }

	// static args = {
	//   person: Args.string({description: 'Person to say hello to', required: true}),
	// }

	// async getPools(): Promise<Pool[]> {
	//   const uri = 'https://midgard.ninerealms.com/v2/pools'
	//   try {
	//     const {data: pools} = await axios.get<Pool[]>(uri)
	//     return pools
	//   } catch (error) {
	//     console.log(error)
	//     this.error(chalk.red(`Error fetching pools at ${uri}`))
	//   }
	// }

	// async getPool(asset: string, network: string): Promise<Pool> {
	//   const uri = network === 'testnet' ?
	//     `https://testnet.midgard.thorchain.info/v2/pool/${asset}` :
	//     `https://midgard.ninerealms.com/v2/pool/${asset}`

	//   try {
	//     const {data: pool} = await axios.get<Pool>(uri)
	//     return pool
	//   } catch {
	//     this.error(chalk.red(`${asset} not found at ${uri}`))
	//   }
	// }

	async connectedActionsPrompt(): Promise<string> {
		const {action}: {action: string} = await inquirer.prompt([
			{
				choices: [
					{
						name: 'Swap',
						value: 'swap',
					},
					// {
					//   name: 'Save',
					//   value: 'save',
					// },
					// {
					//   name: 'Lend',
					//   value: 'lend',
					// },
					// {
					//   name: 'Borrow',
					//   value: 'borrow',
					// },
					{
						name: 'Send',
						value: 'send',
					},
					{
						name: 'Receive',
						value: 'receive',
					},
					{
						name: 'View balances',
						value: 'balances',
					},
					{
						name: 'View Phrase',
						value: 'phrase',
					},
					{
						name: 'Quit',
						value: 'quit',
					},
				],
				message: 'What would you like to do today?',
				name: 'action',
				type: 'list',
			},
		])

		return action
	}

	async connectSwitch(action: string): Promise<string> {
		switch (action) {
			case 'connect': {
				return (await connect(this)) ?? ''
			}

			default: {
				return (await create(this)) ?? ''
			}
		}
	}

	async promptActions({network, phrase, pools}: {network: Network; phrase: string; pools: Pools}): Promise<void> {
		const action = await this.connectedActionsPrompt()

		switch (action) {
			case 'swap': {
				this.promptActions({network, phrase, pools})
				break
			}

			case 'receive': {
				await receive({command: this, network, phrase, pools})
				this.promptActions({network, phrase, pools})
				break
			}

			case 'send': {
				await send({command: this, network, phrase, pools})
				this.promptActions({network, phrase, pools})
				break
			}

			case 'balances': {
				await balances({command: this, network, phrase, pools})
				this.promptActions({network, phrase, pools})
				break
			}

			case 'phrase': {
				// this.log(phrase)
				// const splitPhrase = phrase.split(' ')
				// this.log()
				// this.log(chalk.bgGreen(`${splitPhrase[0]} ${splitPhrase[1]} ${splitPhrase[2]} ${splitPhrase[3]}`))
				// this.log(chalk.bgGreen(`${splitPhrase[4]} ${splitPhrase[5]} ${splitPhrase[6]} ${splitPhrase[7]}`))
				// this.log(chalk.bgGreen(`${splitPhrase[8]} ${splitPhrase[9]} ${splitPhrase[10]} ${splitPhrase[11]}`))
				// this.log()
				await logPhrase({command: this, phrase})

				this.promptActions({network, phrase, pools})
				break
			}

			case 'quit': {
				clear()
				this.log(chalk.greenBright.bold('⚡ Goodbye ⚡'))
			}
		}
	}

	async run(): Promise<void> {
		clear()
		// const {args, flags} = await this.parse(Hello)

		const {flags} = await this.parse(Root)
		const network = flags?.network && flags.network === 'testnet' ? Network.Testnet : Network.Mainnet
		this.log(`you are connecting to ${network}`)

		this.log(chalk.greenBright.bold('⚡ Welcome to TCX CLI ⚡'))
		this.log(chalk.greenBright.bold('🚀 Powered by THORChain 🚀'))

		/**
		 * get the node version as a number
		 */
		const majorNodeVersion = Number(process.versions.node.split('.')[0])

		if (majorNodeVersion !== 16) {
			this.log(chalk.red('Please use Node version 16'))
			this.log(chalk.blue('We suggest using nvm to manage your node versions'))
			this.log(chalk.blueBright('https://github.com/nvm-sh/nvm'))
			return
		}

		this.log(chalk.greenBright('To get started, we need to connect a keystore wallet'))

		console.log('network is:', network)

		const {connectionMethod}: {connectionMethod: string} = await inquirer.prompt([
			{
				choices: [
					{
						name: 'Connect an existing keystore',
						value: 'connect',
					},
					{
						name: 'Create a new keystore',
						value: 'create',
					},
				],
				message: 'How would you like to connect your keystore?',
				name: 'connectionMethod',
				type: 'list',
			},
		])

		const phrase = await this.connectSwitch(connectionMethod)

		const isCorrect = validatePhrase(phrase) // validate phrase if needed returns Boolean
		if (!isCorrect) {
			this.error('Error fetching phrase from keystore')
		}

		const pools = await fetchPools(this)

		this.promptActions({network, phrase, pools})

		// const action = await this.connectedActionsPrompt()
		// this.log(`selected ${action}`)

		// switch (action) {
		// case 'receive':

		//   break

		// default:
		//   break
		// }

		// const chain = await this.selectChainPrompt(pools)
	}

	async selectChainPrompt(pools: Pool[]): Promise<string> {
		const chains = pools.map((pool) => pool.asset.split('.')[0])
		const uniqueChains = [...new Set(chains)]

		const {chain}: {chain: string} = await inquirer.prompt([
			{
				choices: uniqueChains,
				message: 'Select a chain',
				name: 'chain',
				type: 'list',
			},
		])

		return chain
	}

	async selectPoolPrompt(pools: Pool[]): Promise<string> {
		const choices = pools.map((pool) => ({name: pool.asset}))

		const {pool}: {pool: string} = await inquirer.prompt([
			{
				choices,
				message: 'Select a pool',
				name: 'pool',
				type: 'list',
			},
		])

		return pool
	}
}

//
// old working stuff
//
// const {action} = await inquirer.prompt([
//   {
//     name: 'action',
//     message: 'What would you like to do today?',
//     type: 'list',
//     choices: [
//       {
//         name: 'Swap',
//         value: 'swap',
//       },
//       {
//         name: 'Save',
//         value: 'save',
//       },
//       {
//         name: 'Lend',
//         value: 'lend',
//       },
//       {
//         name: 'Borrow',
//         value: 'borrow',
//       },
//     ],
//   },
// ])

// ux.action.start('Fetching pools')
// const pools = await this.getPools(network)
// ux.action.stop() // shows 'starting a process... done'

// const choices = pools.map(pool => ({name: pool.asset}))

// const res: {pool: string} = await inquirer.prompt([
//   {
//     name: 'pool',
//     message: 'Select a pool',
//     type: 'list',
//     choices,
//   },
// ])

// const selectedPool = pools.find(pool => pool.asset === res.pool)
// this.log(selectedPool?.asset)

// this.log(`selected ${action}`)
// this.log(`you are connecting to ${network}`)

// const qrData = 'https://www.example.com' // Replace with your data
// const options = {
//   type: 'terminal', // Render as text in the terminal
//   // width: 8,
// }

// const qrCode = await qrcode.toString(qrData, options)
// this.log(qrCode)
