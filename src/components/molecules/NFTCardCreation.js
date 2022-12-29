
import { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { makeStyles } from '@mui/styles'
import { TextField, Card, CardActions, CardContent, CardMedia, Button, CircularProgress } from '@mui/material'
import axios from 'axios'
import { Web3Context } from '../providers/Web3Provider'

const useStyles = makeStyles({
  root: {
    flexDirection: 'column',
    display: 'flex',
    margin: '15px 15px',
    flexGrow: 1
  },
  cardActions: {
    marginTop: 'auto'
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
    cursor: 'pointer'
  }
})

const defaultFileUrl = 'https://miro.medium.com/max/250/1*DSNfSDcOe33E2Aup1Sww2w.jpeg'

export default function NFTCardCreation({ addNFTToList }) {
  const [file, setFile] = useState(null)
  const [fileUrl, setFileUrl] = useState(defaultFileUrl)
  const classes = useStyles()
  const { register, handleSubmit, reset } = useForm()
  const { CardNftContract, SoldierNftContract, MaterialNftContract } = useContext(Web3Context)
  const [isLoading, setIsLoading] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [trait1, setTrait1] = useState('')
  const [trait2, setTrait2] = useState('')
  const [collection, setCollection] = useState('')

  async function createNft(metadataUrl) {
    var transaction = undefined
    if (collection == 'soldier')
      transaction = await SoldierNftContract.mintToken(metadataUrl)
    if (collection == 'material')
      transaction = await MaterialNftContract.mintToken(metadataUrl)
    if (collection == 'card')
      transaction = await CardNftContract.mintToken(metadataUrl)
    const tx = await transaction.wait()
    const event = tx.events[0]
    const tokenId = event.args[2]
    return tokenId
  }

  function createNFTFormDataFile(name, description, file) {
    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)
    formData.append('file', file)
    return formData
  }

  async function uploadFileToIPFS(formData) {
    const { data } = await axios.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return data.url
  }

  async function onFileChange(event) {
    if (!event.target.files[0]) return
    setFile(event.target.files[0])
    setFileUrl(URL.createObjectURL(event.target.files[0]))
  }

  async function onSubmit({ name, description }) {
    try {
      if (!file || isLoading) return
      setIsLoading(true)
      const formData = createNFTFormDataFile(name, description, file)
      const metadataUrl = await uploadFileToIPFS(formData)
      const tokenId = await createNft(metadataUrl)
      addNFTToList(tokenId)
      setFileUrl(defaultFileUrl)
      reset()
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function mintButton() {

    let data = new FormData();
    data.append('file', file, file.name);
    const imageurl = await axios.post("https://api.nft.storage/upload", data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDJkNEU2NDUyRDI2ZjI4YjZjRjYxNDMwMTViOUM3Qzg4ZDI3NkQ2QzkiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYzMDk5NDU4NDk3NCwibmFtZSI6InN0b3JhZ2UifQ.hAINDNNYz2Je3YzRVrORGA4N_cBcwRWyfRZ-47tkc68`
      }
    })
    const myimageurl = `https://gateway.ipfs.io/ipfs/${imageurl.data.value.cid}/${file.name}`
    const metaData = {
      name: name,
      description: description,
      image: myimageurl,
      traits: {
        trait1: trait1,
        trait2: trait2
      }

    }
    console.log(metaData)
    const resp = await axios.post("http://localhost:5002/api/store/json",
      { json: JSON.stringify(metaData) })
    console.log(resp.data.uri)
    const tokenId = await createNft(resp.data.uri, collection)
    addNFTToList(tokenId)
    setFileUrl(myimageurl)
    reset()
  }

  return (
    <Card className={classes.root} component="form" sx={{ maxWidth: 345 }} onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="file-input">
        <CardMedia
          className={classes.media}
          alt='Upload image'
          image={fileUrl}
        />
      </label>
      <input
        style={{ display: 'none' }}
        type="file"
        name="file"
        id="file-input"
        onChange={onFileChange}
      />
      <CardContent sx={{ paddingBottom: 0 }}>
        <TextField
          id="name-input"
          label="Name"
          name="name"
          size="small"
          fullWidth
          required
          margin="dense"
          disabled={isLoading}
          onChange={(e) => { setName(e.target.value) }}
        />
        <TextField
          id="description-input"
          label="Description"
          name="description"
          size="small"
          multiline
          rows={2}
          fullWidth
          required
          margin="dense"
          disabled={isLoading}
          onChange={(e) => { setDescription(e.target.value) }}
        />
        <TextField
          id="collection-input"
          label="Collection"
          name="collection"
          size="small"
          multiline
          rows={2}
          fullWidth
          required
          margin="dense"
          disabled={isLoading}
          onChange={(e) => { setCollection(e.target.value) }}
        />
        <TextField
          id="trait1-input"
          label="Trait1"
          name="trait1"
          size="small"
          multiline
          rows={2}
          fullWidth
          required
          margin="dense"
          disabled={isLoading}
          onChange={(e) => { setTrait1(e.target.value) }}
        />
        <TextField
          id="trait2-input"
          label="Trait2"
          name="trait2"
          size="small"
          multiline
          rows={2}
          fullWidth
          required
          margin="dense"
          disabled={isLoading}
          onChange={(e) => { setTrait2(e.target.value) }}
        />
      </CardContent>
      <CardActions className={classes.cardActions}>
        <Button size="small" onClick={mintButton}>
          {isLoading
            ? <CircularProgress size="20px" />
            : 'Create'
          }
        </Button>
      </CardActions>
    </Card>
  )
}
