import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Space, Typography, Divider, message, Spin, Descriptions } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { getProfile, updateProfile, changePassword } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

const Profile = () => {
  const [profileLoading, setProfileLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const { user, updateUser } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  // Populate form when profile is loaded
  useEffect(() => {
    if (profile) {
      profileForm.setFieldsValue({
        email: profile.email,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
      });
    }
  }, [profile, profileForm]);

  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (error) {
      message.error('Failed to load profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileUpdate = async (values) => {
    setUpdateLoading(true);
    try {
      const updatedProfile = await updateProfile({
        email: values.email,
        first_name: values.first_name,
        last_name: values.last_name,
      });
      setProfile(updatedProfile);
      // Update AuthContext with new user data
      if (updateUser) {
        updateUser(updatedProfile);
      }
      message.success('Profile updated successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.email?.[0] || 
                          error.response?.data?.non_field_errors?.[0] ||
                          'Failed to update profile';
      message.error(errorMessage);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    setPasswordLoading(true);
    try {
      await changePassword({
        old_password: values.old_password,
        new_password: values.new_password,
        new_password_confirm: values.new_password_confirm,
      });
      passwordForm.resetFields();
      message.success('Password changed successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.old_password?.[0] || 
                          error.response?.data?.new_password?.[0] ||
                          error.response?.data?.non_field_errors?.[0] ||
                          'Failed to change password';
      message.error(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>My Profile</Title>

        <Card title="Profile Information">
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Email">{profile.email}</Descriptions.Item>
            <Descriptions.Item label="Username">{profile.username || profile.email}</Descriptions.Item>
            <Descriptions.Item label="First Name">{profile.first_name || 'Not set'}</Descriptions.Item>
            <Descriptions.Item label="Last Name">{profile.last_name || 'Not set'}</Descriptions.Item>
            <Descriptions.Item label="User Type">
              <Text strong style={{ textTransform: 'capitalize' }}>
                {profile.user_type || 'customer'}
              </Text>
            </Descriptions.Item>
            {profile.date_joined && (
              <Descriptions.Item label="Member Since">
                {new Date(profile.date_joined).toLocaleDateString()}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        <Card
          title={
            <Space>
              <UserOutlined />
              <span>Update Profile</span>
            </Space>
          }
        >
          <Form
            form={profileForm}
            layout="vertical"
            onFinish={handleProfileUpdate}
            autoComplete="off"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter your email!' },
                { type: 'email', message: 'Please enter a valid email!' },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="first_name"
              label="First Name"
            >
              <Input placeholder="First Name" />
            </Form.Item>

            <Form.Item
              name="last_name"
              label="Last Name"
            >
              <Input placeholder="Last Name" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={updateLoading} block>
                Update Profile
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card
          title={
            <Space>
              <LockOutlined />
              <span>Change Password</span>
            </Space>
          }
        >
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordChange}
            autoComplete="off"
          >
            <Form.Item
              name="old_password"
              label="Current Password"
              rules={[{ required: true, message: 'Please enter your current password!' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Current Password" />
            </Form.Item>

            <Form.Item
              name="new_password"
              label="New Password"
              rules={[
                { required: true, message: 'Please enter a new password!' },
                { min: 8, message: 'Password must be at least 8 characters!' },
              ]}
            >
              <Input.Password placeholder="New Password" />
            </Form.Item>

            <Form.Item
              name="new_password_confirm"
              label="Confirm New Password"
              dependencies={['new_password']}
              rules={[
                { required: true, message: 'Please confirm your new password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('new_password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirm New Password" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={passwordLoading} block>
                Change Password
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </div>
  );
};

export default Profile;


