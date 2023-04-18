const hre = require('hardhat')
const dotenv = require('dotenv')
const fs = require('fs')

function replaceEnvContractAddresses (marketplaceAddress,stake, networkName) {
  const envFileName = '.env.local'
  const envFile = fs.readFileSync(envFileName, 'utf-8')
  const env = dotenv.parse(envFile)
  env[`MARKETPLACE_CONTRACT_ADDRESS_${networkName}`] = marketplaceAddress
  env[`STAKER_CONTRACT_ADDRESS_${networkName}`] = stake
  const newEnv = Object.entries(env).reduce((env, [key, value]) => {
    return `${env}${key}=${value}\n`
  }, '')

  fs.writeFileSync(envFileName, newEnv)
}

async function main () {
  process.env.IS_RUNNING = true
  const Marketplace = await hre.ethers.getContractFactory('Marketplace')
  const marketplace = await Marketplace.deploy()
  await marketplace.deployed()
  console.log('Marketplace deployed to:', marketplace.address)

  const Staking = await hre.ethers.getContractFactory('Staking')
  const Happy = await hre.ethers.getContractFactory('Happy')
  const happy = await Happy.deploy("Happy","HAPPY")
  await happy.deployed()
  console.log('$HAPPY deployed to:',happy.address)
  const staking = await Staking.deploy(process.env.NFT_ADDRESS,happy.address)
  await staking.deployed()

  replaceEnvContractAddresses(marketplace.address,staking.address,hre.network.name.toUpperCase())
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
