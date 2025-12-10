const generateInvoice = (order) => {
  // In production, use 'pdfkit' to generate a real PDF stream
  return `
    INVOICE #${order._id}
    Date: ${new Date().toLocaleDateString()}
    Customer: ${order.shippingAddress.address}
    -----------------------------------
    Items:
    ${order.orderItems.map(item => `${item.title} (${item.size}) x ${item.quantity} - $${item.price}`).join('\n')}
    -----------------------------------
    Total: $${order.totalPrice}
    Status: ${order.isPaid ? 'PAID' : 'PENDING'}
  `;
};

export default generateInvoice;