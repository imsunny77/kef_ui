import { Layout, Menu, Button, Space, Typography, Badge } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import {
  ShoppingOutlined,
  BarChartOutlined,
  LogoutOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { getCartItemCount } = useCart();

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#001529',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <ShoppingOutlined style={{ fontSize: '24px', color: '#fff' }} />
          <Button
            type="text"
            icon={<HomeOutlined />}
            onClick={() => navigate('/products')}
            style={{
              color: location.pathname === '/products' || location.pathname.startsWith('/products/') ? '#1890ff' : '#fff',
              fontWeight: location.pathname === '/products' || location.pathname.startsWith('/products/') ? 'bold' : 'normal',
            }}
          >
            Products
          </Button>
          {user?.user_type === 'customer' && (
            <Button
              type="text"
              icon={<UnorderedListOutlined />}
              onClick={() => navigate('/orders')}
              style={{
                color: location.pathname === '/orders' ? '#1890ff' : '#fff',
                fontWeight: location.pathname === '/orders' ? 'bold' : 'normal',
              }}
            >
              My Orders
            </Button>
          )}
          {user?.user_type === 'admin' && (
            <Menu
              theme="dark"
              mode="horizontal"
              selectedKeys={[location.pathname]}
              items={[
                {
                  key: '/reports',
                  icon: <BarChartOutlined />,
                  label: 'Reports',
                },
              ]}
              onClick={handleMenuClick}
              style={{ flex: 1, minWidth: 0, background: 'transparent' }}
            />
          )}
        </div>
        <Space>
          <Badge count={getCartItemCount()} showZero>
            <Button
              type="text"
              icon={<ShoppingCartOutlined />}
              onClick={() => navigate('/cart')}
              style={{ color: '#fff', fontSize: '20px' }}
            />
          </Badge>
          <Button
            type="text"
            icon={<UserOutlined />}
            onClick={() => navigate('/profile')}
            style={{
              color: location.pathname === '/profile' ? '#1890ff' : '#fff',
              fontWeight: location.pathname === '/profile' ? 'bold' : 'normal',
            }}
          >
            Profile
          </Button>
          <Text style={{ color: '#fff' }}>{user?.email}</Text>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ color: '#fff' }}
          >
            Logout
          </Button>
        </Space>
      </Header>
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        {children}
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Mini Order & Payment System ©2024
      </Footer>
    </Layout>
  );
};

export default AppLayout;

