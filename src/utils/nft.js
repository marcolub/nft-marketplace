import axios from 'axios'
import { ethers } from 'ethers'

export async function getTokenMetadataByTokenId(nftContract, tokenId) {
  try {
    // const tokenUri = await nftContract.tokenURI(tokenId)
    const { data: metadata } = await axios.get(`https://api.covalenthq.com/v1/80001/tokens/${nftContract.address}/nft_metadata/${tokenId}/?key=ckey_ccf942cdee9b4cd6b223e2d5767`)
    console.log(metadata)
    return metadata.data.items[0].nft_data[0].external_data
  } catch (error) {
    console.log(error)
  }
}

export function mapAvailableMarketItems(nftContract) {
  return async (marketItem) => {
    const metadata = await getTokenMetadataByTokenId(nftContract, marketItem.tokenId)
    return mapMarketItem(marketItem, metadata)
  }
}

export function mapCreatedAndOwnedTokenIdsAsMarketItems(marketplaceContract, nftContract, account) {
  return async (tokenId) => {
    const metadata = await getTokenMetadataByTokenId(nftContract, tokenId)
    const approveAddress = await nftContract.getApproved(tokenId)
    const hasMarketApproval = approveAddress === marketplaceContract.address
    const [foundMarketItem, hasFound] = await marketplaceContract.getLatestMarketItemByTokenId(tokenId)
    const marketItem = hasFound ? foundMarketItem : {}
    return mapMarketItem(marketItem, metadata, tokenId, account, hasMarketApproval)
  }
}

export function mapMarketItem(marketItem, metadata, tokenId, account, hasMarketApproval) {
  if (metadata != undefined) {
    return {
      price: marketItem.price ? ethers.utils.formatUnits(marketItem.price, 'ether') : undefined,
      tokenId: marketItem.tokenId || tokenId,
      marketItemId: marketItem.marketItemId || undefined,
      creator: marketItem.creator || account,
      seller: marketItem.seller || undefined,
      owner: marketItem.owner || account,
      sold: marketItem.sold || false,
      canceled: marketItem.canceled || false,
      image: metadata.image,
      name: metadata.name,
      description: metadata.description,
      hasMarketApproval: hasMarketApproval || false
    }
  }
}

export async function getUniqueOwnedAndCreatedTokenIds(nftContract) {
  // const nftIdsCreatedByMe = await nftContract.getTokensCreatedByMe()
  const nftIdsOwnedByMe = await nftContract.getTokensOwnedByMe()
  const myNftIds = [...nftIdsOwnedByMe]
  return [...new Map(myNftIds.map((item) => [item._hex, item])).values()]
}

export async function getMaterialList(stake) {
  const ids = await stake.ids()
  return [...new Map(ids.map((item) => [item._hex, item])).values()]
} 
