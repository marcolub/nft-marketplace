import { useContext, useEffect, useState } from 'react'
import NFTCardList from '../src/components/organisms/NFTCardList'
import { Web3Context } from '../src/components/providers/Web3Provider'
import { LinearProgress } from '@mui/material'
import UnsupportedChain from '../src/components/molecules/UnsupportedChain'
import { mapAvailableMarketItems } from '../src/utils/nft'
import { Row, Switch } from 'antd'

export default function Marketplace() {
  const [nfts, setNfts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { marketplaceContract, CardNftContract, SoldierNftContract, MaterialNftContract, account, isReady, network } = useContext(Web3Context)

  const [collectionFilter, setCollectionFilter] = useState({
    soldier: true,
    material: true,
    card: true
  })

  useEffect(() => {
    loadNFTs()
  }, [account, isReady, collectionFilter])

  async function loadNFTs() {
    if (!isReady) return
    const data = await marketplaceContract.fetchAvailableMarketItems()
    var items1 = []
    var items2 = []
    var items3 = []
    if (collectionFilter.soldier)
      items1 = await Promise.all(data.map(mapAvailableMarketItems(SoldierNftContract)))
    if (collectionFilter.material)
      items2 = await Promise.all(data.map(mapAvailableMarketItems(MaterialNftContract)))
    if (collectionFilter.card)
      items3 = await Promise.all(data.map(mapAvailableMarketItems(CardNftContract)))
    var final = []
    final = final.concat(items1, items2, items3)
    console.log(final)
    final.sort((x) => x.marketItemId)
    setNfts(final)
    setIsLoading(false)
  }

  if (!network) return <UnsupportedChain />
  if (isLoading) return <LinearProgress />
  if (!isLoading && !nfts.length) return <h1>No NFTs for sale</h1>
  return (
    <>
      <Row>
        <p>Soldier <Switch defaultChecked onChange={() => {
          setCollectionFilter(current => ({
            ...current,
            soldier: !collectionFilter.soldier
          }))
        }} /></p>
        <p>Material <Switch defaultChecked onChange={() => {
          setCollectionFilter(current => ({
            ...current,
            material: !collectionFilter.material
          }))
        }} /></p>
        <p>Card <Switch defaultChecked onChange={() => {
          setCollectionFilter(current => ({
            ...current,
            card: !collectionFilter.card
          }))
        }} /></p>
      </Row>
      <NFTCardList nfts={nfts} setNfts={setNfts} withCreateNFT={false} />
    </>
  )
}
