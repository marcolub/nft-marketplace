import { useContext, useEffect, useState } from 'react'
import NFTCardList from '../src/components/organisms/NFTCardList'
import { Web3Context } from '../src/components/providers/Web3Provider'
import { LinearProgress } from '@mui/material'
import UnsupportedChain from '../src/components/molecules/UnsupportedChain'
import { mapAvailableMarketItems } from '../src/utils/nft'
import { Card, CardActions, CardContent, CardMedia, Button, Divider, Box, CircularProgress } from '@mui/material'

import { Alchemy, Network } from 'alchemy-sdk';

const settings = {
  apiKey: process.env["ALCHEMY_KEY"], 
  network: Network.MATIC_MUMBAI
};

const alchemy = new Alchemy(settings);

export default function Home () {
  const [nfts, setNfts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { marketplaceContract,CardNftContract, SoldierNftContract,MaterialNftContract,account, isReady, network } = useContext(Web3Context)

  const [lastSold,setLastSold] = useState([])
  const [lastListed,setLastListed] = useState([])
  const [totalSold,setTotalSold] = useState(0)

  useEffect(() => {
    loadNFTs()
  }, [account,isReady])

  async function loadNFTs () {
    if (!isReady) return
    var data = await marketplaceContract.getAvailableMarketItems()
    var items = await Promise.all(data.map(mapAvailableMarketItems(process.env["NFT_ADDRESS"])))
    const listed = items.filter((x)=> x!== undefined).sort(function(a,b){return b-a})
    setLastListed(listed.slice(0,5))
    data = await marketplaceContract.getSoldMarketItems()
    items = await Promise.all(data.map(mapAvailableMarketItems(process.env["NFT_ADDRESS"])))
    const sold = items.filter((x)=> x!== undefined).sort(function(a, b){return b-a})
    setTotalSold(sold.length)
    setLastSold(sold.slice(0,5))
    setIsLoading(false)
  }

  if (!network) return <UnsupportedChain/>
  // if (isLoading) return <LinearProgress/>
  // if (!isLoading && !lastSold.length && !lastListed.length) return 
  //   <h1>No NFTs for sale</h1>
  return (
    <>
    {/* <Card>
    <img style={{maxWidth:'600px'}} src={img1.src}></img>
    </Card> */}
    <Card>
    <h1>Total sold</h1>
    <p>{totalSold}</p>
    </Card>
    <Card>
    <h1>Last sold</h1>
    <NFTCardList nfts={lastSold} setNfts={setLastSold} withCreateNFT={false}/>
    </Card>
    <Card>
    <h1>Last listed</h1>
    <NFTCardList nfts={lastListed} setNfts={setLastListed} withCreateNFT={false}/>
    </Card>
    </>
  )
}
