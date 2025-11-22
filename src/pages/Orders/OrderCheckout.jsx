import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Space, Spin, message as antdMessage, Divider } from 'antd';
import { ArrowLeftOutlined, CreditCardOutlined } from '@ant-design/icons';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createOrder, createPaymentIntent, confirmPayment } from '../../services/orders';
import { useCart } from '../../contexts/CartContext';
import styled from 'styled-components';

const { Title, Text } = Typography;

const StyledCard = styled(Card)`
  margin-bottom: 24px;
`;

// Initialize Stripe (you'll need to add your Stripe publishable key to env)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const CheckoutForm = ({ orderId, clientSecret, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setMessage({ type: 'error', text: submitError.message });
        setLoading(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success/${orderId}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment with backend
        await confirmPayment(orderId);
        antdMessage.success('Payment successful!');
        onSuccess();
      } else {
        setMessage({ type: 'info', text: 'Payment processing...' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {message && (
        <div style={{ marginTop: '16px', color: message.type === 'error' ? '#ff4d4f' : '#1890ff' }}>
          {message.text}
        </div>
      )}
      <Button
        type="primary"
        htmlType="submit"
        block
        size="large"
        loading={loading}
        disabled={!stripe || !elements}
        icon={<CreditCardOutlined />}
        style={{ marginTop: '24px' }}
      >
        Pay Now
      </Button>
    </form>
  );
};

const OrderCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [step, setStep] = useState(1); // 1: Address form, 2: Payment
  const { clearCart } = useCart();

  const product = location.state?.product;
  const cartItems = location.state?.cartItems;

  // Determine items to display and calculate total
  const getOrderItems = () => {
    if (cartItems && cartItems.length > 0) {
      return cartItems.map((item) => ({
        product: item.product,
        quantity: item.quantity,
      }));
    } else if (product) {
      return [{ product, quantity: 1 }];
    }
    return [];
  };

  const orderItems = getOrderItems();

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      const price = parseFloat(item.product.price) || 0;
      return total + price * item.quantity;
    }, 0);
  };

  useEffect(() => {
    if (orderItems.length === 0) {
      antdMessage.warning('No items selected. Redirecting to products...');
      navigate('/products');
    }
  }, [orderItems.length, navigate]);

  const handleOrderCreation = async (values) => {
    if (orderItems.length === 0) return;

    setLoading(true);
    try {
      const orderData = {
        shipping_address: values.shipping_address,
        billing_address: values.billing_address || values.shipping_address,
        items: orderItems.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      };

      const createdOrder = await createOrder(orderData);
      setOrder(createdOrder);

      // Clear cart if checkout was from cart
      if (cartItems && cartItems.length > 0) {
        clearCart();
      }

      // Create payment intent
      const paymentData = await createPaymentIntent(createdOrder.id);
      setClientSecret(paymentData.client_secret);
      setStep(2);
    } catch (error) {
      antdMessage.error('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    navigate(`/order-success/${order.id}`);
  };

  if (orderItems.length === 0) {
    return null;
  }

  const total = calculateTotal();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => {
            if (cartItems && cartItems.length > 0) {
              navigate('/cart');
            } else {
              navigate('/products');
            }
          }}
        >
          {cartItems && cartItems.length > 0 ? 'Back to Cart' : 'Back to Products'}
        </Button>

        <Title level={2}>Checkout</Title>

        <StyledCard title="Order Summary">
          <Space orientation="vertical" style={{ width: '100%' }}>
            {orderItems.map((item, index) => {
              const itemTotal = parseFloat(item.product.price) * item.quantity;
              return (
                <div key={item.product.id || index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>
                      {item.product.name} {item.quantity > 1 && `× ${item.quantity}`}
                    </Text>
                    <Text strong>${itemTotal.toFixed(2)}</Text>
                  </div>
                  {item.product.price && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      ${parseFloat(item.product.price).toFixed(2)} each
                    </Text>
                  )}
                </div>
              );
            })}
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong>Total</Text>
              <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                ${total.toFixed(2)}
              </Text>
            </div>
          </Space>
        </StyledCard>

        {step === 1 && (
          <StyledCard title="Shipping Information">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleOrderCreation}
              autoComplete="off"
            >
              <Form.Item
                name="shipping_address"
                label="Shipping Address"
                rules={[{ required: true, message: 'Please enter shipping address!' }]}
              >
                <Input.TextArea rows={4} placeholder="Enter your shipping address" />
              </Form.Item>

              <Form.Item
                name="billing_address"
                label="Billing Address (optional)"
              >
                <Input.TextArea rows={4} placeholder="Enter your billing address (leave blank to use shipping address)" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                  Continue to Payment
                </Button>
              </Form.Item>
            </Form>
          </StyledCard>
        )}

        {step === 2 && clientSecret && (
          <StyledCard title="Payment">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
              </div>
            ) : (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                  },
                }}
              >
                <CheckoutForm
                  orderId={order.id}
                  clientSecret={clientSecret}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            )}
          </StyledCard>
        )}
      </Space>
    </div>
  );
};

export default OrderCheckout;

