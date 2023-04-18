import axios from 'axios'
import { ethers } from 'ethers'

import { Alchemy, Network, fromHex } from "alchemy-sdk";

const settings = {
  apiKey: process.env["ALCHEMY_KEY"], 
  network: Network.MATIC_MUMBAI
};

const alchemy = new Alchemy(settings);

export async function getTransactionsHistory(nftContractAddress, tokenId){
  const address = [nftContractAddress];

  const response = await alchemy.core.getAssetTransfers({
    contractAddresses: address,
    category: ["erc721"],
    excludeZeroValue: false,
  });
  let txns = response.transfers.filter(
    (txn) => fromHex(txn.erc721TokenId) == tokenId
  );
  return txns;
}

export async function getTokenMetadataByTokenId(nftContractAddress, tokenId) {
  try {
    let response = await alchemy.nft.getNftMetadata(nftContractAddress, tokenId);
    // const { data: metadata } = await axios.get(`https://api.covalenthq.com/v1/80001/tokens/${nftContractAddress}/nft_metadata/${tokenId}/?key=ckey_3f22b995f6ed416e93a941476f5`)
    // console.log(metadata)
    //return metadata.data.items[0].nft_data[0].external_data
    return response.rawMetadata;
  } catch (error) {
    console.log(error)
  }
}

export function mapAvailableMarketItems(nftContractAddress) {
  return async (marketItem) => {
    const metadata = await getTokenMetadataByTokenId(nftContractAddress, marketItem.tokenId)
    return mapMarketItem(marketItem, metadata)
  }
}

export function mapCreatedAndOwnedTokenIdsAsMarketItems(marketplaceContract, nftContractAddress, account) {
  return async (tokenId) => {
    const metadata = await getTokenMetadataByTokenId(nftContractAddress, tokenId)
    const sellId = marketplaceContract.sellIdfromTokenId(tokenId);
    const [foundMarketItem, hasFound] = await marketplaceContract.getSell(sellId);
    const marketItem = hasFound ? foundMarketItem : {}
    console.log(metadata);
    return mapMarketItem(marketItem, metadata, tokenId, account)
  }
}

export function mapMarketItem(marketItem, metadata, tokenId, account) {
  console.log(metadata)
  if (metadata !== undefined && metadata.metadata === undefined) {
    return {
      price: marketItem.price ? ethers.utils.formatUnits(marketItem.price, 'ether') : undefined,
      tokenId: marketItem.tokenId || tokenId,
      marketItemId: marketItem.sellId || undefined,
      creator: marketItem.creator || account,
      seller: marketItem.seller || undefined,
      owner: account,
      sold: marketItem.sold || false,
      canceled: marketItem.canceled || false,
      image: metadata.image.replace('ipfs://','https://alchemy.mypinata.cloud/ipfs/') || '',
      name: metadata.name,
      description: metadata.description
    }
  }
}

export async function getUniqueOwnedAndCreatedTokenIds(account,nftContractAddress) {
  const allNfts = await alchemy.nft.getNftsForOwner(account);
  const nftIdsOwnedByMe = allNfts.ownedNfts.filter((nft) =>
      nft.contract.address == nftContractAddress.toLowerCase()
  );
  return nftIdsOwnedByMe.map(function(x) {return x.tokenId;})
  // return [...new Map(myNftIds.map((item) => [item._hex, item])).values()]
}

// export async function getMaterialList(stake) {
//   const ids = await stake.ids()
//   return [...new Map(ids.map((item) => [item._hex, item])).values()]
// } 
