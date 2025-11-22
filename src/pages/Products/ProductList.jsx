import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Input, Pagination, Spin, Typography, Image, Space, message, Badge, Select } from 'antd';
import { 
  ShoppingCartOutlined, 
  SearchOutlined,
  PlusOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../../services/products';
import { getCategories } from '../../services/categories';
import { useCart } from '../../contexts/CartContext';
import styled from 'styled-components';

const { Title, Text } = Typography;
const { Meta } = Card;

const StyledCard = styled(Card)`
  height: 100%;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
`;

// Color palette for category cards - two gray variants
const CATEGORY_COLORS = [
  { primary: '#737373', light: '#fafafa', border: '#d9d9d9' }, // Light gray
  { primary: '#262626', light: '#f5f5f5', border: '#bfbfbf' }, // Dark gray
];

// Get color for a category based on ID - alternates between 2 gray colors
const getCategoryColor = (categoryId) => {
  const index = typeof categoryId === 'number' 
    ? categoryId % 2 
    : categoryId.toString().charCodeAt(0) % 2;
  return CATEGORY_COLORS[index];
};

// Get icon for a category - returns first letter in a circle
const getCategoryIcon = (category, colors) => {
  const categoryName = category?.name || '?';
  const initial = categoryName.charAt(0).toUpperCase();
  return (
    <div style={{
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      backgroundColor: colors?.primary || '#1890ff',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: 'bold',
      flexShrink: 0,
    }}>
      {initial}
    </div>
  );
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();
  const { addToCart, cartItems, updateQuantity } = useCart();

  useEffect(() => {
    fetchProducts();
  }, [currentPage, pageSize, searchTerm, selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data.results || []);
    } catch (error) {
      message.error('Failed to load categories');
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        page_size: pageSize,
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      const data = await getProducts(params);
      setProducts(data.results || []);
      setTotal(data.count || 0);
    } catch (error) {
      message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = (product) => {
    navigate('/checkout', { state: { product } });
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  // Get quantity of a product in cart
  const getCartQuantity = (productId) => {
    const cartItem = cartItems.find((item) => item.product.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleQuantityIncrease = (product, currentQuantity) => {
    if (product.stock_quantity !== undefined && currentQuantity >= product.stock_quantity) {
      message.warning(`Only ${product.stock_quantity} items available in stock`);
      return;
    }
    updateQuantity(product.id, currentQuantity + 1);
  };

  const handleQuantityDecrease = (product, currentQuantity) => {
    if (currentQuantity > 1) {
      updateQuantity(product.id, currentQuantity - 1);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  // Group products by category
  const groupProductsByCategory = (products) => {
    const grouped = {};
    
    products.forEach((product) => {
      const categoryId = product.category?.id || 'uncategorized';
      const categoryName = product.category?.name || 'Uncategorized';
      
      if (!grouped[categoryId]) {
        grouped[categoryId] = {
          id: categoryId,
          name: categoryName,
          slug: product.category?.slug || '',
          description: product.category?.description || '',
          products: [],
        };
      }
      
      grouped[categoryId].products.push(product);
    });
    
    return Object.values(grouped);
  };

  const groupedProducts = groupProductsByCategory(products);

  return (
    <div>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>Products</Title>
          <Space>
            <Select
              placeholder="Filter by category"
              allowClear
              style={{ width: 200 }}
              value={selectedCategory}
              onChange={handleCategoryChange}
              options={[
                { label: 'All Categories', value: null },
                ...categories.map(category => ({
                  label: category.name,
                  value: category.id,
                })),
              ]}
            />
            <Input
              placeholder="Search products..."
              prefix={<SearchOutlined />}
              allowClear
              style={{ width: 300 }}
              onPressEnter={(e) => handleSearch(e.target.value)}
              onChange={(e) => !e.target.value && handleSearch('')}
            />
          </Space>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Text type="secondary">No products found</Text>
          </div>
        ) : (
          <>
            <Space orientation="vertical" size="large" style={{ width: '100%' }}>
              {groupedProducts.map((categoryGroup) => {
                const colors = getCategoryColor(categoryGroup.id);
                const icon = getCategoryIcon(categoryGroup, colors);
                
                return (
                  <Card
                    key={categoryGroup.id}
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          fontSize: '24px', 
                          color: colors.primary,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          {icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <Title level={4} style={{ margin: 0, color: colors.primary }}>
                            {categoryGroup.name}
                          </Title>
                          {categoryGroup.description && (
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {categoryGroup.description}
                            </Text>
                          )}
                        </div>
                        <Badge 
                          count={categoryGroup.products.length} 
                          style={{ backgroundColor: colors.primary }}
                        />
                      </div>
                    }
                    style={{ 
                      marginBottom: '24px',
                      borderTop: `4px solid ${colors.primary}`,
                      borderLeft: `1px solid ${colors.border}`,
                      borderRight: `1px solid ${colors.border}`,
                      borderBottom: `1px solid ${colors.border}`,
                      backgroundColor: colors.light,
                    }}
                    styles={{
                      header: {
                        backgroundColor: colors.light,
                        borderBottom: `2px solid ${colors.border}`,
                      }
                    }}
                  >
                  <Row gutter={[16, 16]}>
                    {categoryGroup.products.map((product) => (
                      <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                        <StyledCard
                          cover={
                            <div
                              onClick={() => navigate(`/products/${product.id}`)}
                              style={{ cursor: 'pointer' }}
                            >
                              {product.image ? (
                                <Image
                                  alt={product.name}
                                  src={product.image}
                                  height={200}
                                  style={{ objectFit: 'cover' }}
                                  fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4="
                                />
                              ) : (
                                <div
                                  style={{
                                    height: 200,
                                    background: '#f0f0f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#999',
                                  }}
                                >
                                  No Image
                                </div>
                              )}
                            </div>
                          }
                          actions={[
                            <Space key="actions" direction="vertical" style={{ width: '100%' }} size="small">
                              <Button
                                type="primary"
                                icon={<ShoppingCartOutlined />}
                                block
                                onClick={() => handleBuyNow(product)}
                              >
                                Buy Now
                              </Button>
                              {getCartQuantity(product.id) > 0 ? (
                                <Space.Compact style={{ width: '100%' }}>
                                  <Button
                                    icon={<MinusOutlined />}
                                    onClick={() => handleQuantityDecrease(product, getCartQuantity(product.id))}
                                    disabled={getCartQuantity(product.id) <= 1}
                                    style={{ width: '33%' }}
                                  />
                                  <div
                                    style={{
                                      width: '34%',
                                      padding: '4px 8px',
                                      textAlign: 'center',
                                      border: '1px solid #d9d9d9',
                                      borderLeft: 'none',
                                      borderRight: 'none',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      backgroundColor: '#fafafa',
                                      fontWeight: '500',
                                      fontSize: '14px',
                                    }}
                                  >
                                    {getCartQuantity(product.id)}
                                  </div>
                                  <Button
                                    icon={<PlusOutlined />}
                                    onClick={() => handleQuantityIncrease(product, getCartQuantity(product.id))}
                                    disabled={product.stock_quantity !== undefined && getCartQuantity(product.id) >= product.stock_quantity}
                                    style={{ width: '33%' }}
                                  />
                                </Space.Compact>
                              ) : (
                                <Button
                                  icon={<PlusOutlined />}
                                  block
                                  onClick={() => handleAddToCart(product)}
                                >
                                  Add to Cart
                                </Button>
                              )}
                            </Space>,
                          ]}
                        >
                          <Meta
                            title={
                              <div
                                onClick={() => navigate(`/products/${product.id}`)}
                                style={{ cursor: 'pointer' }}
                              >
                                {product.name}
                              </div>
                            }
                            description={
                              <div>
                                <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                                  ${product.price}
                                </Text>
                                {product.stock_quantity !== undefined && (
                                  <div style={{ marginTop: '8px' }}>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                      Stock: {product.stock_quantity}
                                    </Text>
                                  </div>
                                )}
                                {product.description && (
                                  <div style={{ marginTop: '8px' }}>
                                    <Text type="secondary" style={{ fontSize: '12px' }} ellipsis>
                                      {product.description}
                                    </Text>
                                  </div>
                                )}
                              </div>
                            }
                          />
                        </StyledCard>
                      </Col>
                    ))}
                  </Row>
                </Card>
                );
              })}
            </Space>
            {total > pageSize && (
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={total}
                  onChange={(page, size) => {
                    setCurrentPage(page);
                    setPageSize(size);
                  }}
                  showSizeChanger
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} of ${total} products`
                  }
                />
              </div>
            )}
          </>
        )}
      </Space>
    </div>
  );
};

export default ProductList;

