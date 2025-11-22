import { useNavigate } from 'react-router-dom';
import { Card, Button, Space, Typography, Image, Divider, Empty, message, Spin } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined, ArrowLeftOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useCart } from '../../contexts/CartContext';
import styled from 'styled-components';

const { Title, Text } = Typography;

const StyledCard = styled(Card)`
  margin-bottom: 16px;
`;

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart, loading } = useCart();

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      message.warning('Your cart is empty');
      return;
    }
    navigate('/checkout', { state: { cartItems } });
  };

  const handleQuantityIncrease = (itemId, currentQuantity, maxStock) => {
    if (maxStock !== undefined && currentQuantity >= maxStock) {
      message.warning(`Only ${maxStock} items available in stock`);
      return;
    }
    updateQuantity(itemId, currentQuantity + 1);
  };

  const handleQuantityDecrease = (itemId, currentQuantity) => {
    if (currentQuantity > 1) {
      updateQuantity(itemId, currentQuantity - 1);
    }
  };

  if (loading && cartItems.length === 0) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '50px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/products')}
          >
            Back to Products
          </Button>
          <Title level={2}>Shopping Cart</Title>
          <Card>
            <Empty
              description="Your cart is empty"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" onClick={() => navigate('/products')}>
                Browse Products
              </Button>
            </Empty>
          </Card>
        </Space>
      </div>
    );
  }

  const total = getCartTotal();

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>Shopping Cart</Title>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/products')}
          >
            Continue Shopping
          </Button>
        </div>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
              {cartItems.map((item) => {
                const product = item.product;
                // Use item.price if available (from backend), otherwise fall back to product.price
                const itemPrice = parseFloat(item.price || product?.price || 0);
                const itemTotal = itemPrice * item.quantity;
                const itemId = item.id; // Use cart item ID from backend

                return (
                  <StyledCard key={itemId || product?.id}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      {product?.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={120}
                          height={120}
                          style={{ objectFit: 'cover', borderRadius: '8px' }}
                          fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4="
                        />
                      ) : (
                        <div
                          style={{
                            width: 120,
                            height: 120,
                            background: '#f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#999',
                            borderRadius: '8px',
                          }}
                        >
                          No Image
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <Title level={4} style={{ margin: 0, marginBottom: '8px' }}>
                          {product?.name || 'Unknown Product'}
                        </Title>
                        {product?.description && (
                          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                            {product.description}
                          </Text>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                          <Space>
                            <Text>Quantity:</Text>
                            <Space.Compact>
                              <Button
                                icon={<MinusOutlined />}
                                onClick={() => handleQuantityDecrease(itemId, item.quantity)}
                                disabled={item.quantity <= 1 || loading}
                                style={{ width: '32px' }}
                              />
                              <div
                                style={{
                                  minWidth: '50px',
                                  padding: '4px 12px',
                                  textAlign: 'center',
                                  border: '1px solid #d9d9d9',
                                  borderLeft: 'none',
                                  borderRight: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: '#fafafa',
                                  fontWeight: '500',
                                }}
                              >
                                {item.quantity}
                              </div>
                              <Button
                                icon={<PlusOutlined />}
                                onClick={() => handleQuantityIncrease(itemId, item.quantity, product?.stock_quantity)}
                                disabled={(product?.stock_quantity !== undefined && item.quantity >= product.stock_quantity) || loading}
                                style={{ width: '32px' }}
                              />
                            </Space.Compact>
                            {product?.stock_quantity !== undefined && (
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                Stock: {product.stock_quantity}
                              </Text>
                            )}
                          </Space>
                          <Space>
                            <Text strong style={{ fontSize: '16px' }}>
                              ${itemTotal.toFixed(2)}
                            </Text>
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => removeFromCart(itemId)}
                              disabled={loading}
                            >
                              Remove
                            </Button>
                          </Space>
                        </div>
                        <div style={{ marginTop: '8px' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            ${itemPrice.toFixed(2)} each
                          </Text>
                        </div>
                      </div>
                    </div>
                  </StyledCard>
                );
              })}
            </Space>
          </div>

          <div style={{ width: '100%', maxWidth: '350px' }}>
            <Card title="Order Summary">
              <Space orientation="vertical" style={{ width: '100%' }}>
                {cartItems.map((item) => {
                  const product = item.product;
                  const itemPrice = parseFloat(item.price || product?.price || 0);
                  const itemTotal = itemPrice * item.quantity;
                  return (
                    <div key={item.id || product?.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>
                        {product?.name || 'Unknown Product'} × {item.quantity}
                      </Text>
                      <Text>${itemTotal.toFixed(2)}</Text>
                    </div>
                  );
                })}
                <Divider style={{ margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>Total</Text>
                  <Text strong style={{ fontSize: '20px', color: '#1890ff' }}>
                    ${total.toFixed(2)}
                  </Text>
                </div>
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<ShoppingCartOutlined />}
                  onClick={handleCheckout}
                  disabled={loading}
                  style={{ marginTop: '16px' }}
                >
                  Proceed to Checkout
                </Button>
                <Button
                  type="text"
                  danger
                  block
                  onClick={clearCart}
                  disabled={loading}
                  style={{ marginTop: '8px' }}
                >
                  Clear Cart
                </Button>
              </Space>
            </Card>
          </div>
        </div>
      </Space>
    </div>
  );
};

export default Cart;

