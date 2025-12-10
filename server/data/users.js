import bcrypt from 'bcryptjs';

const users = [
  {
    name: 'Super Admin',
    email: 'admin@lara.com',
    password: 'password123',
    isAdmin: true,
    isVendor: false,
    isApproved: true,
    addresses: []
  },
  {
    name: 'Verified Vendor',
    email: 'vendor@lara.com',
    password: 'password123',
    isAdmin: false,
    isVendor: true,
    isApproved: true,
    addresses: []
  },
  {
    name: 'Pending Vendor',
    email: 'pending@lara.com',
    password: 'password123',
    isAdmin: false,
    isVendor: true,
    isApproved: false, // For testing approval flow
    addresses: []
  },
  {
    name: 'Blocked User',
    email: 'blocked@lara.com',
    password: 'password123',
    isAdmin: false,
    isVendor: false,
    isBlocked: true, // For testing login blocks
    addresses: []
  },
  {
    name: 'Jane Doe',
    email: 'user@lara.com',
    password: 'password123',
    isAdmin: false,
    isVendor: false,
    addresses: [
        {
            address: '123 Fashion Ave',
            city: 'New York',
            postalCode: '10001',
            country: 'USA',
            isDefault: true
        }
    ]
  },
  {
    name: 'John Smith',
    email: 'john@example.com',
    password: 'password123',
    isAdmin: false,
    isVendor: false,
    addresses: []
  }
];

export default users;