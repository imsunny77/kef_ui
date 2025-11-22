import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Result, Card, Typography, Space, Button, Descriptions, Tag, Spin, message } from 'antd';
import { CheckCircleOutlined, ShoppingOutlined } from '@ant-design/icons';
import { getOrder } from '../../services/orders';
import styled from 'styled-components';

const { Title, Text } = Typography;

const StyledCard = styled(Card)`
  margin-bottom: 24px;
`;

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const orderData = await getOrder(orderId);
      setOrder(orderData);
    } catch (error) {
      message.error('Failed to load order details');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <Result
        status="error"
        title="Order Not Found"
        subTitle="The order you're looking for doesn't exist."
        extra={
          <Button type="primary" onClick={() => navigate('/products')}>
            Go to Products
          </Button>
        }
      />
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Result
          icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          title="Payment Successful!"
          subTitle="Your order has been placed successfully."
        />

        <StyledCard title="Order Details">
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Order Number">
              <Text strong>{order.order_number}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getOrderStatusColor(order.status)}>
                {order.status?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Total Amount">
              <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                ${order.total_amount}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Customer Email">
              {order.customer_email}
            </Descriptions.Item>
            <Descriptions.Item label="Shipping Address">
              {order.shipping_address}
            </Descriptions.Item>
            <Descriptions.Item label="Billing Address">
              {order.billing_address}
            </Descriptions.Item>
            {order.crm_sync_status && (
              <Descriptions.Item label="CRM Sync Status">
                <Tag color={getCrmStatusColor(order.crm_sync_status)}>
                  {order.crm_sync_status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Order Date">
              {new Date(order.created_at).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        </StyledCard>

        {order.items && order.items.length > 0 && (
          <StyledCard title="Order Items">
            <Space orientation="vertical" style={{ width: '100%' }} size="middle">
              {order.items.map((item) => (
                <Card key={item.id} size="small">
                  <Space orientation="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong>{item.product?.name}</Text>
                      <Text>${item.price} x {item.quantity}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">Subtotal</Text>
                      <Text strong>${item.subtotal}</Text>
                    </div>
                  </Space>
                </Card>
              ))}
            </Space>
          </StyledCard>
        )}

        <div style={{ textAlign: 'center' }}>
          <Space>
            <Button
              type="primary"
              icon={<ShoppingOutlined />}
              onClick={() => navigate('/products')}
            >
              Continue Shopping
            </Button>
          </Space>
        </div>
      </Space>
    </div>
  );
};

export default OrderSuccess;

