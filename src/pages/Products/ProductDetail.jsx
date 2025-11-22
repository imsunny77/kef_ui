import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Space, Typography, Image, Spin, Tag, message, Row, Col, Divider } from 'antd';
import { ShoppingCartOutlined, ArrowLeftOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { getProduct } from '../../services/products';
import { useCart } from '../../contexts/CartContext';
import styled from 'styled-components';

const { Title, Text } = Typography;

const StyledCard = styled(Card)`
  margin-bottom: 24px;
`;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, cartItems, updateQuantity, refreshCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // Refresh cart from backend on mount
  useEffect(() => {
    refreshCart();
  }, []);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const data = await getProduct(id);
      setProduct(data);
    } catch (error) {
      message.error('Failed to load product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const getCartQuantity = (productId) => {
    const cartItem = cartItems.find((item) => item.product?.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  const handleBuyNow = () => {
    navigate('/checkout', { state: { product } });
  };

  const handleQuantityIncrease = () => {
    const currentQuantity = getCartQuantity(product.id);
    if (product.stock_quantity !== undefined && currentQuantity >= product.stock_quantity) {
      message.warning(`Only ${product.stock_quantity} items available in stock`);
      return;
    }
    updateQuantity(product.id, currentQuantity + 1);
  };

  const handleQuantityDecrease = () => {
    const currentQuantity = getCartQuantity(product.id);
    if (currentQuantity > 1) {
      updateQuantity(product.id, currentQuantity - 1);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const cartQuantity = getCartQuantity(product.id);
  const isInCart = cartQuantity > 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/products')}
        >
          Back to Products
        </Button>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                style={{ width: '100%', borderRadius: '8px' }}
                fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1lbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4="
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '400px',
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
          </Col>
          <Col xs={24} md={12}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {product.category && (
                <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                  {product.category.name}
                </Tag>
              )}
              <Title level={2} style={{ margin: 0 }}>
                {product.name}
              </Title>
              <div>
                <Text strong style={{ fontSize: '32px', color: '#1890ff' }}>
                  ${parseFloat(product.price).toFixed(2)}
                </Text>
              </div>
              {product.description && (
                <div>
                  <Title level={5}>Description</Title>
                  <Text style={{ fontSize: '16px', lineHeight: '1.6' }}>
                    {product.description}
                  </Text>
                </div>
              )}
              <Divider />
              <div>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {product.stock_quantity !== undefined && (
                    <div>
                      <Text strong>Stock: </Text>
                      <Text>{product.stock_quantity} available</Text>
                    </div>
                  )}
                  <div>
                    <Text strong>Product ID: </Text>
                    <Text>{product.id}</Text>
                  </div>
                  {product.slug && (
                    <div>
                      <Text strong>Slug: </Text>
                      <Text>{product.slug}</Text>
                    </div>
                  )}
                </Space>
              </div>
              <Divider />
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  block
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
                {isInCart ? (
                  <Space.Compact style={{ width: '100%' }}>
                    <Button
                      icon={<MinusOutlined />}
                      onClick={handleQuantityDecrease}
                      disabled={cartQuantity <= 1}
                      size="large"
                      style={{ width: '33%' }}
                    />
                    <div
                      style={{
                        width: '34%',
                        padding: '8px 16px',
                        textAlign: 'center',
                        border: '1px solid #d9d9d9',
                        borderLeft: 'none',
                        borderRight: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#fafafa',
                        fontWeight: '500',
                        fontSize: '16px',
                      }}
                    >
                      {cartQuantity}
                    </div>
                    <Button
                      icon={<PlusOutlined />}
                      onClick={handleQuantityIncrease}
                      disabled={product.stock_quantity !== undefined && cartQuantity >= product.stock_quantity}
                      size="large"
                      style={{ width: '33%' }}
                    />
                  </Space.Compact>
                ) : (
                  <Button
                    icon={<PlusOutlined />}
                    size="large"
                    block
                    onClick={handleAddToCart}
                  >
                    Add to Cart
                  </Button>
                )}
              </Space>
            </Space>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default ProductDetail;



