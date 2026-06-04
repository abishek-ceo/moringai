// Razorpay payment flow
async function startRazorpayPayment(cartItems, orderData) {
  // Step 1: Create Razorpay order on server
  const res = await fetch('/api/payments/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: cartItems })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Could not create payment order');

  // Step 2: Get Razorpay key sent back from server
  const razorpayKey = data.key;
  if (!razorpayKey) throw new Error('Razorpay key not configured on server.');

  const customer = orderData.customer || {};

  return new Promise((resolve, reject) => {
    const options = {
      key: razorpayKey,
      amount: data.order.amount,
      currency: 'INR',
      name: 'Moringai',
      description: 'Moringa Order',
      order_id: data.order.id,
      handler: async function(response) {
        try {
          // Step 3: Verify payment signature
          const verify = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
          });
          const verified = await verify.json();
          if (!verified.success) return reject(new Error('Payment verification failed'));

          // Step 4: Save order to database
          const orderRes = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...orderData,
              paymentMethod: 'razorpay',
              payment: { method: 'razorpay', ...response }
            })
          });
          const savedOrder = await orderRes.json();
          if (!orderRes.ok) return reject(new Error(savedOrder.error || 'Order save failed'));
          resolve(savedOrder);
        } catch (err) {
          reject(err);
        }
      },
      prefill: {
        name: customer.name || '',
        email: customer.email || '',
        contact: customer.phone || ''
      },
      theme: { color: '#145c3a' },
      modal: {
        ondismiss: function() {
          reject(new Error('Payment cancelled by user'));
        }
      }
    };
    if (typeof Razorpay === 'undefined') {
      reject(new Error('Razorpay SDK not loaded. Please refresh and try again.'));
      return;
    }
    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function(r) {
      reject(new Error(r.error && r.error.description ? r.error.description : 'Payment failed'));
    });
    rzp.open();
  });
}
