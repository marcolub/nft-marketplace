import { LinearProgress } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import InstallMetamask from '../src/components/molecules/InstallMetamask'
import NFTCardList from '../src/components/organisms/NFTCardList'
import { Web3Context } from '../src/components/providers/Web3Provider'
import { mapCreatedAndOwnedTokenIdsAsMarketItems, getUniqueOwnedAndCreatedTokenIds, getMaterialList } from '../src/utils/nft'
import UnsupportedChain from '../src/components/molecules/UnsupportedChain'
import ConnectWalletMessage from '../src/components/molecules/ConnectWalletMessage'
import { Button ,Row} from 'antd'

export default function Staker() {
  const [nfts, setNfts] = useState([])
  const [nfts2, setNfts2] = useState([])
  const { account, marketplaceContract, StakerContract, MaterialNftContract, isReady, hasWeb3, network } = useContext(Web3Context)
  const [isLoading, setIsLoading] = useState(true)
  const [hasWindowEthereum, setHasWindowEthereum] = useState(false)

  const [info, setInfo] = useState({})

  useEffect(() => {
    setHasWindowEthereum(window.ethereum)
  }, [])

  useEffect(() => {
    loadNFTs()
  }, [account, isReady])

  function onclick() {
    MaterialNftContract.setApprovalForAll(StakerContract.address, true);
  }

  async function claim() {
    await StakerContract.claimRewards()
  }

  async function showInfo() {
    const result = await StakerContract.userStakeInfo(account)
    setInfo({
      availableRewards: parseInt(result._availableRewards._hex, 16),
      tokensStaked: parseInt(result._tokensStaked._hex, 16)
    })
    var myMaterialList = await getMaterialList(StakerContract)
    var myNfts = await Promise.all(myMaterialList.map(
      mapCreatedAndOwnedTokenIdsAsMarketItems(marketplaceContract, MaterialNftContract, account)
    ))
    myNfts = myNfts.filter((x) => x.owner == account)
    setNfts2(myNfts)
  }

  async function loadNFTs() {
    if (!isReady || !hasWeb3) return <></>
    var myUniqueCreatedAndOwnedTokenIds = await getUniqueOwnedAndCreatedTokenIds(MaterialNftContract)
    var myNfts = await Promise.all(myUniqueCreatedAndOwnedTokenIds.map(
      mapCreatedAndOwnedTokenIdsAsMarketItems(marketplaceContract, MaterialNftContract, account)))
    myNfts.sort((x) => x.marketItemId)
    setNfts(myNfts)
    showInfo()
    setIsLoading(false)
  }

  if (!hasWindowEthereum) return <InstallMetamask />
  if (!hasWeb3) return <ConnectWalletMessage />
  if (!network) return <UnsupportedChain />
  if (isLoading) return <LinearProgress />

  return (
    <>
      <Row>
        <Button type='primary' onClick={onclick}>Approve staking</Button>
        <Button type='primary' onClick={claim}>Claim rewards</Button>
      </Row>
      <p>Tokens Staked : {info.tokensStaked}</p>
      <p>Available Rewards : {info.availableRewards}</p>
      <NFTCardList nfts={nfts} setNfts={setNfts} withCreateNFT={false} withStaker={true} />
      <NFTCardList nfts={nfts2} setNfts={setNfts2} withCreateNFT={false} withStaker2={true} />
    </>
  )
}
