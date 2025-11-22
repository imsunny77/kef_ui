import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Input, Pagination, Spin, Typography, Image, Space, message, Badge } from 'antd';
import { 
  ShoppingCartOutlined, 
  SearchOutlined,
  LaptopOutlined,
  ShoppingOutlined,
  BookOutlined,
  HomeOutlined,
  CarOutlined,
  MedicineBoxOutlined,
  AppstoreOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../../services/products';
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

// Color palette for category cards
const CATEGORY_COLORS = [
  { primary: '#1890ff', light: '#e6f7ff', border: '#91d5ff' }, // Blue
  { primary: '#52c41a', light: '#f6ffed', border: '#b7eb8f' }, // Green
  { primary: '#faad14', light: '#fffbe6', border: '#ffe58f' }, // Orange
  { primary: '#f5222d', light: '#fff1f0', border: '#ffa39e' }, // Red
  { primary: '#722ed1', light: '#f9f0ff', border: '#d3adf7' }, // Purple
  { primary: '#13c2c2', light: '#e6fffb', border: '#87e8de' }, // Cyan
  { primary: '#eb2f96', light: '#fff0f6', border: '#ffadd2' }, // Pink
  { primary: '#fa8c16', light: '#fff7e6', border: '#ffd591' }, // Orange
];

// Get color for a category based on ID
const getCategoryColor = (categoryId) => {
  const index = typeof categoryId === 'number' 
    ? categoryId % CATEGORY_COLORS.length 
    : categoryId.toString().charCodeAt(0) % CATEGORY_COLORS.length;
  return CATEGORY_COLORS[index];
};

// Normalize string for matching (lowercase, trim, remove special chars)
const normalizeString = (str) => {
  if (!str) return '';
  return str.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
};

// Get icon for a category based on category object
const getCategoryIcon = (category, colors) => {
  const iconMap = {
    'electronics': <LaptopOutlined />,
    'clothing': <ShoppingOutlined />,
    'books': <BookOutlined />,
    'home': <HomeOutlined />,
    'garden': <HomeOutlined />,
    'automotive': <CarOutlined />,
    'health': <MedicineBoxOutlined />,
    'beauty': <MedicineBoxOutlined />,
    'sports': <AppstoreOutlined />,
    'toys': <GiftOutlined />,
  };
  
  // Get normalized values from category object
  const slug = normalizeString(category?.slug || '');
  const name = normalizeString(category?.name || '');
  
  // Try exact match with slug first (most reliable)
  if (slug && iconMap[slug]) {
    return iconMap[slug];
  }
  
  // Try exact match with normalized name
  if (name && iconMap[name]) {
    return iconMap[name];
  }
  
  // Try partial match with slug
  if (slug) {
    for (const [key, icon] of Object.entries(iconMap)) {
      if (slug.includes(key) || key.includes(slug)) {
        return icon;
      }
    }
  }
  
  // Try partial match with name
  if (name) {
    for (const [key, icon] of Object.entries(iconMap)) {
      if (name.includes(key) || key.includes(name)) {
        return icon;
      }
    }
  }
  
  // Fallback: show first letter in a circle
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [currentPage, pageSize, searchTerm]);

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

  const handleSearch = (value) => {
    setSearchTerm(value);
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
          <Input
            placeholder="Search products..."
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 300 }}
            onPressEnter={(e) => handleSearch(e.target.value)}
            onChange={(e) => !e.target.value && handleSearch('')}
          />
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
                            product.image ? (
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
                            )
                          }
                          actions={[
                            <Button
                              type="primary"
                              icon={<ShoppingCartOutlined />}
                              block
                              onClick={() => handleBuyNow(product)}
                            >
                              Buy Now
                            </Button>,
                          ]}
                        >
                          <Meta
                            title={product.name}
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

