import NFTModal from '../organisms/NFTModal'
import NFTModalProvider from '../providers/NFTModalProvider'
import { Web3Context } from '../providers/Web3Provider'
import { Breadcrumb, Layout, Menu, Row, Col } from 'antd'
import { Button } from '@mui/material';
import React, { useContext, useState } from 'react'
import {
  DesktopOutlined,
  PieChartOutlined,
  UserOutlined
} from '@ant-design/icons'
import Image from 'next/image'
import logo from './img/logo.png'
import Link from 'next/link'
import NavBar from '../molecules/NavBar';

const { Content, Sider } = Layout

export default function BaseLayout({ children }) {
  const { network, balance, isReady, hasWeb3 } = useContext(Web3Context)
  const isLowOnEther = balance < 0.1

  const [collapsed, setCollapsed] = useState(true)

  const { account } = useContext(Web3Context)

  const giveMenu = () => {
    return <Menu theme="dark" mode="inline">
      <Menu.Item style={{ borderRadius: "0px" }} key="1">
        <PieChartOutlined />
        <span><Link href='/'>Home</Link></span>
      </Menu.Item>
      <Menu.Item style={{ borderRadius: "0px" }} key="2">
        <UserOutlined />
        <span><Link href='/my-nfts'>My NFTs</Link></span>
      </Menu.Item>
      <Menu.Item style={{ borderRadius: "0px" }} key="3">
        <DesktopOutlined />
        <span><Link href='/marketplace'>Marketplace</Link></span>
      </Menu.Item>
      {/* <Menu.Item style={{ borderRadius: "0px" }} key="4">
        <DesktopOutlined />
        <span><Link href='/staking'>Staking</Link></span>
      </Menu.Item> */}
    </Menu>

  }

  return (
    <>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
          <div style={{ height: 100, background: 'rgba(255, 255, 255, 0.2)' }} >
            <Image src={logo} height="80px" width="80px"></Image>
          </div>
          {giveMenu()}
        </Sider>
        <Layout className="site-layout">
          <Content >
            <NavBar></NavBar>
            <div style={{ padding: 24, minHeight: 360 }}>
              <NFTModalProvider>
                {/* <NavBar /> */}
                {hasWeb3 && isReady && network && isLowOnEther}
                {children}
                <NFTModal />
              </NFTModalProvider>
            </div>
          </Content>
        </Layout>
      </Layout>
    </>
  )
}
