import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Space, Button, Tag, Spin, Empty, Divider, message } from 'antd';
import { ShoppingOutlined, ArrowLeftOutlined, EyeOutlined } from '@ant-design/icons';
import { getOrders } from '../../services/orders';
import styled from 'styled-components';

const { Title, Text } = Typography;

const StyledCard = styled(Card)`
  margin-bottom: 16px;
  transition: box-shadow 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      // Sort orders by date (newest first)
      const sortedOrders = Array.isArray(data) 
        ? data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        : [];
      setOrders(sortedOrders);
    } catch (error) {
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'processing';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getCrmStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>My Orders</Title>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/products')}
          >
            Back to Products
          </Button>
        </div>

        {orders.length === 0 ? (
          <Card>
            <Empty
              description="You haven't placed any orders yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" onClick={() => navigate('/products')}>
                Browse Products
              </Button>
            </Empty>
          </Card>
        ) : (
          <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
            {orders.map((order) => {
              const itemCount = order.items?.length || 0;
              const firstItem = order.items?.[0];
              
              return (
                <StyledCard key={order.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div>
                          <Text strong style={{ fontSize: '16px' }}>
                            {order.order_number}
                          </Text>
                        </div>
                        <div>
                          <Text type="secondary">
                            {new Date(order.created_at).toLocaleString()}
                          </Text>
                        </div>
                        <div>
                          <Tag color={getOrderStatusColor(order.status)}>
                            {order.status?.toUpperCase()}
                          </Tag>
                          {order.crm_sync_status && (
                            <Tag color={getCrmStatusColor(order.crm_sync_status)} style={{ marginLeft: '8px' }}>
                              CRM: {order.crm_sync_status.toUpperCase()}
                            </Tag>
                          )}
                        </div>
                        {itemCount > 0 && (
                          <div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {itemCount} item{itemCount > 1 ? 's' : ''}
                              {firstItem && ` • ${firstItem.product?.name}${itemCount > 1 ? ' + more' : ''}`}
                            </Text>
                          </div>
                        )}
                      </Space>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                      <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                        ${parseFloat(order.total_amount).toFixed(2)}
                      </Text>
                      <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/order-success/${order.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </StyledCard>
              );
            })}
          </Space>
        )}
      </Space>
    </div>
  );
};

export default OrderHistory;

