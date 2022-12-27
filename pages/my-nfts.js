import { LinearProgress } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import InstallMetamask from '../src/components/molecules/InstallMetamask'
import NFTCardList from '../src/components/organisms/NFTCardList'
import { Web3Context } from '../src/components/providers/Web3Provider'
import { mapCreatedAndOwnedTokenIdsAsMarketItems, getUniqueOwnedAndCreatedTokenIds } from '../src/utils/nft'
import UnsupportedChain from '../src/components/molecules/UnsupportedChain'
import ConnectWalletMessage from '../src/components/molecules/ConnectWalletMessage'

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([])
  const [temp, setTemp] = useState([])
  const { account, marketplaceContract, SoldierNftContract, MaterialNftContract, isReady, hasWeb3, network } = useContext(Web3Context)
  const [isLoading, setIsLoading] = useState(true)
  const [hasWindowEthereum, setHasWindowEthereum] = useState(false)

  const [isdone, setIsdone] = useState(false)

  useEffect(() => {
    setHasWindowEthereum(window.ethereum)
  }, [])

  useEffect(() => {
    loadNFTs()
  }, [account, isReady])

  Promise.delay = function (t, val) {
    return new Promise(resolve => {
      setTimeout(resolve.bind(null, val), t);
    });
  }

  Promise.raceAll = function (promises, timeoutTime, timeoutVal) {
    return Promise.all(promises.map(p => {
      return Promise.race([p, Promise.delay(timeoutTime, timeoutVal)])
    }));
  }

  async function loadNFTs() {
    if (!isReady || !hasWeb3) return <></>
    var myUniqueCreatedAndOwnedTokenIds = await getUniqueOwnedAndCreatedTokenIds(SoldierNftContract)
    var myNfts1 = await Promise.all(
      myUniqueCreatedAndOwnedTokenIds.map(
        mapCreatedAndOwnedTokenIdsAsMarketItems(marketplaceContract, SoldierNftContract, account)
      ))
    var myUniqueCreatedAndOwnedTokenIds = await getUniqueOwnedAndCreatedTokenIds(MaterialNftContract)
    var myNfts2 = await Promise.raceAll(myUniqueCreatedAndOwnedTokenIds.map(
      mapCreatedAndOwnedTokenIdsAsMarketItems(marketplaceContract, MaterialNftContract, account)
    ), 1000, null).then(results => {
      let final = results.filter(item => !!item);
      return final
    })
    const myNfts = myNfts1.concat(myNfts2)
    console.log(myNfts)
    setNfts(myNfts)
    setIsLoading(false)
  }

  if (!hasWindowEthereum) return <InstallMetamask />
  if (!hasWeb3) return <ConnectWalletMessage />
  if (!network) return <UnsupportedChain />
  if (isLoading) return <LinearProgress />

  return (
    <NFTCardList nfts={nfts} setNfts={setNfts} withCreateNFT={true} />
  )
}
