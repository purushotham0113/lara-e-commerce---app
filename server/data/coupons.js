const coupons = [
    { 
        code: 'WELCOME10', 
        discountPercentage: 10, 
        expiryDate: new Date(Date.now() + 30*24*60*60*1000), // 30 days from now
        isActive: true
    }, 
    { 
        code: 'SUMMER20', 
        discountPercentage: 20, 
        expiryDate: new Date(Date.now() + 60*24*60*60*1000), // 60 days
        isActive: true
    },
    { 
        code: 'VIP50', 
        discountPercentage: 50, 
        expiryDate: new Date(Date.now() + 7*24*60*60*1000), // 1 week
        isActive: true
    },
    { 
        code: 'EXPIRED15', 
        discountPercentage: 15, 
        expiryDate: new Date(Date.now() - 5*24*60*60*1000), // Past date
        isActive: true // Active but expired by date logic
    },
    {
        code: 'INACTIVE30',
        discountPercentage: 30,
        expiryDate: new Date(Date.now() + 30*24*60*60*1000),
        isActive: false // Explicitly inactive
    }
];

export default coupons;