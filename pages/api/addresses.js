export default function handler (req, res) {
  const network = req.query.network
  res.status(200).json({
    marketplaceAddress: process.env[`MARKETPLACE_CONTRACT_ADDRESS_${network}`],
    SoldierNftAddress: process.env[`SOLDIER_CONTRACT_ADDRESS_${network}`],
    MaterialNftAddress: process.env[`MATERIAL_CONTRACT_ADDRESS_${network}`]
  })
}
