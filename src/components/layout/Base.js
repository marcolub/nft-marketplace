import { useContext } from 'react'
import LowOnBalanceTip from '../molecules/LowOnBalanceTip'
import NFTModal from '../organisms/NFTModal'
import NFTModalProvider from '../providers/NFTModalProvider'
import { Web3Context } from '../providers/Web3Provider'
import { Breadcrumb, Layout, Menu } from 'antd'
import React, { useState } from 'react'
import {
  DesktopOutlined,
  PieChartOutlined,
  UserOutlined,
} from '@ant-design/icons'
import Image from 'next/image'
import logo from './img/logo.png'

const { Content, Sider } = Layout

export default function BaseLayout({ children }) {
  const { network, balance, isReady, hasWeb3 } = useContext(Web3Context)
  const isLowOnEther = balance < 0.1

  const [collapsed, setCollapsed] = useState(true)

  const { account } = useContext(Web3Context)

  const giveMenu = () => {
    
      return <Menu theme="dark" mode="inline">
        <Menu.Item key="1">

          <PieChartOutlined />
          <span>Home</span>

        </Menu.Item>
        <Menu.Item key="2">
          <UserOutlined />
          
            <span><a href='/my-nfts'>My NFTs</a></span>
          
        </Menu.Item>
        <Menu.Item key="3">
          <DesktopOutlined />
          
          <span><a href='/'>Marketplace</a></span>
          
        </Menu.Item>
        <Menu.SubMenu title="Collections">
          <Menu.Item key="4">

            <span>Soldier</span>

          </Menu.Item>
          <Menu.Item key="5">
            <span>Card</span>
          </Menu.Item>
          <Menu.Item key="6">
            <span>Material</span>
          </Menu.Item>
        </Menu.SubMenu>
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
          <Content style={{ margin: '0 16px' }}>
            <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item>User</Breadcrumb.Item>
              <Breadcrumb.Item>{account}</Breadcrumb.Item>
            </Breadcrumb>
            <div style={{ padding: 24, minHeight: 360 }}>
              <NFTModalProvider>
                {/* <NavBar /> */}
                {hasWeb3 && isReady && network && isLowOnEther && <LowOnBalanceTip />}
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
