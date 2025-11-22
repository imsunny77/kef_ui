import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Space, Spin, message as antdMessage, Divider } from 'antd';
import { ArrowLeftOutlined, CreditCardOutlined } from '@ant-design/icons';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createOrder, createPaymentIntent, confirmPayment } from '../../services/orders';
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

  const product = location.state?.product;

  useEffect(() => {
    if (!product) {
      antdMessage.warning('No product selected. Redirecting to products...');
      navigate('/products');
    }
  }, [product, navigate]);

  const handleOrderCreation = async (values) => {
    if (!product) return;

    setLoading(true);
    try {
      const orderData = {
        shipping_address: values.shipping_address,
        billing_address: values.billing_address || values.shipping_address,
        items: [
          {
            product_id: product.id,
            quantity: 1,
          },
        ],
      };

      const createdOrder = await createOrder(orderData);
      setOrder(createdOrder);

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

  if (!product) {
    return null;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/products')}
        >
          Back to Products
        </Button>

        <Title level={2}>Checkout</Title>

        <StyledCard title="Order Summary">
          <Space orientation="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong>{product.name}</Text>
              <Text strong>${product.price}</Text>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong>Total</Text>
              <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                ${product.price}
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

