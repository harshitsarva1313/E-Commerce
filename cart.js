// Cart page script - handles cart display, qty controls, totals, actions, payment modal
let cartItems = normalizeCart(JSON.parse(localStorage.getItem('cartItems') || '[]'));
let modalCart = []; // Temp cart for modal (single or all)
let currentOTP = null; // For OTP verification

function normalizeCart(items) {
  const map = new Map();
  items.forEach(item => {
    if (map.has(item.id)) {
      map.get(item.id).qty += (item.qty || 1);
    } else {
      map.set(item.id, {...item, qty: item.qty || 1});
    }
  });
  return Array.from(map.values());
}

function saveCart() {
  localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

function getTotal() {
  return cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0).toFixed(2);
}

function getItemCount() {
  return cartItems.reduce((sum, item) => sum + item.qty, 0);
}

function updateTotals() {
  const countEl = document.getElementById('cartCount');
  const totalEl = document.querySelector('.total-price');
  const buyAllBtn = document.getElementById('buyAllBtn');
  
  countEl.textContent = `${getItemCount()} items`;
  totalEl.textContent = `$${getTotal()}`;
  
  if (cartItems.length > 0) {
    buyAllBtn.disabled = false;
  } else {
    buyAllBtn.disabled = true;
  }
}

function renderCart() {
  const container = document.getElementById('cartItemsList');
  const emptyState = document.getElementById('emptyCart');
  
  if (cartItems.length === 0) {
    emptyState.classList.remove('hidden');
    container.innerHTML = '';
    return;
  }
  
  emptyState.classList.add('hidden');
  container.innerHTML = cartItems.map(item => `
    <article class="cart-item" data-id="${item.id}">
      <img src="${item.image}" alt="${item.title}" class="cart-image" onerror="this.src='https://via.placeholder.com/100?text=No+Image'">
      <div class="cart-info">
        <h3>${item.title}</h3>
        <p class="cart-price">$${item.price.toFixed(2)}</p>
      </div>
      <div class="qty-section">
        <div class="qty-controls">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
          <span class="qty-display">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
        <div class="item-actions">
          <button class="btn-buy" onclick="buyNow(${item.id})">Buy Now</button>
          <button class="btn-remove" onclick="removeItem(${item.id})">Remove</button>
        </div>
      </div>
    </article>
  `).join('');
}

function changeQty(id, delta) {
  const item = cartItems.find(item => item.id === id);
  if (item) {
    item.qty = Math.max(1, item.qty + delta);
    saveCart();
    renderCart();
    updateTotals();
  }
}

function removeItem(id) {
  if (confirm('Remove this item from cart?')) {
    cartItems = cartItems.filter(item => item.id !== id);
    saveCart();
    renderCart();
    updateTotals();
  }
}

function buyNow(id) {
  const item = cartItems.find(item => item.id === id);
  if (item) {
    modalCart = [item];
    showPaymentModal();
  }
}

document.getElementById('buyAllBtn').addEventListener('click', () => {
  if (cartItems.length > 0) {
    modalCart = [...cartItems];
    showPaymentModal();
  }
});

// Payment Modal Functions
function showPaymentModal() {
  const modal = document.getElementById('paymentModal');
  const title = document.getElementById('modalTitle');
  title.textContent = modalCart.length === 1 ? 'Buy Now' : 'Buy All';
  document.getElementById('userName').value = '';
  document.getElementById('phone').value = '';
  document.getElementById('otp').value = '';
  document.getElementById('address').value = '';
  document.querySelectorAll('input[name="payment"]').forEach(r => r.checked = false);
  document.getElementById('emi').checked = false;
  currentOTP = null;
  document.getElementById('sendOtpBtn').textContent = 'Send OTP';
  
  // Show EMI if electronics
  const hasElectronic = modalCart.some(item => isElectronic(item.title));
  document.getElementById('emiOption').classList.toggle('hidden', !hasElectronic);
  
  modal.classList.remove('hidden');
}

function isElectronic(title) {
  const keywords = ['phone', 'laptop', 'tv', 'headphone', 'tablet', 'monitor', 'speaker', 'camera', 'charger'];
  return keywords.some(kw => title.toLowerCase().includes(kw));
}

function getModalTotal() {
  return modalCart.reduce((sum, item) => sum + (item.price * item.qty), 0).toFixed(2);
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendOTP() {
  const phone = document.getElementById('phone').value;
  if (!phone || !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
    alert('Enter valid 10-digit phone number');
    return;
  }
  currentOTP = generateOTP();
  document.getElementById('sendOtpBtn').textContent = 'Resend OTP';
  alert(`OTP sent to ${phone}: ${currentOTP}`); // Simulate - in prod, send via SMS API
}

function verifyOTP() {
  const otp = document.getElementById('otp').value;
  if (otp === currentOTP) {
    return true;
  }
  alert('Invalid OTP');
  return false;
}

function placeOrder(e) {
  e.preventDefault();
  const name = document.getElementById('userName').value;
  const phone = document.getElementById('phone').value;
  const otpValid = verifyOTP();
  const address = document.getElementById('address').value;
  const payment = document.querySelector('input[name="payment"]:checked')?.value;
  const emi = document.getElementById('emi').checked;

  if (!name || !phone || !otpValid || !address || !payment) {
    alert('Please fill all fields and verify OTP');
    return;
  }

  const total = getModalTotal();
  const timestamp = new Date().toLocaleString();
  const order = {
    id: Date.now(),
    items: [...modalCart],
    total: parseFloat(total),
    customer: { name, phone, address },
    payment,
    emi,
    timestamp,
    status: 'placed'
  };

  // Save order to localStorage for My Order page
  let orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.unshift(order);
  localStorage.setItem('orders', JSON.stringify(orders));

  // Show bill
  document.getElementById('paymentForm').classList.add('hidden');
  showBill(order);

  // Clear relevant cart items
  if (modalCart.length === cartItems.length && cartItems.length > 0) {
    // Buy All
    cartItems = [];
  } else {
    // Buy Now single
    const id = modalCart[0].id;
    cartItems = cartItems.filter(item => item.id !== id);
  }
  saveCart();
  renderCart();
  updateTotals();
}

function showBill(order) {
  const details = document.getElementById('billDetails');
  const total = order.total.toFixed(2);
  details.innerHTML = `
    <div class="bill-header">
      <h3>Order Bill - #${order.id}</h3>
      <p>Date: ${order.timestamp}</p>
    </div>
    <div class="bill-customer">
      <p><strong>Customer:</strong> ${order.customer.name}</p>
      <p><strong>Phone:</strong> ${order.customer.phone}</p>
      <p><strong>Address:</strong> ${order.customer.address}</p>
    </div>
    <div class="bill-payment">
      <p><strong>Payment:</strong> ${order.payment}${order.emi ? ' (EMI)' : ''}</p>
    </div>
    <table class="bill-table">
      <thead>
        <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
      </thead>
      <tbody>
        ${order.items.map(item => `
          <tr>
            <td>${item.title}</td>
            <td>${item.qty}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>$${(item.price * item.qty).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="bill-total">
      <strong>Total: $${total}</strong>
    </div>
  `;
  document.getElementById('orderBill').classList.remove('hidden');
}

window.printBill = function() {
  window.print();
}

// Close modal helper
function closeModal() {
  document.getElementById('paymentModal').classList.add('hidden');
  document.getElementById('paymentForm').classList.remove('hidden');
  document.getElementById('orderBill').classList.add('hidden');
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  cartItems = normalizeCart(JSON.parse(localStorage.getItem('cartItems') || '[]'));
  renderCart();
  updateTotals();

  // Modal event listeners
  document.getElementById('closeModal').onclick = closeModal;
  document.getElementById('sendOtpBtn').onclick = sendOTP;
  document.getElementById('paymentForm').onsubmit = placeOrder;
  document.getElementById('closeBill').onclick = closeModal;
  document.getElementById('paymentModal').onclick = (e) => {
    if (e.target.classList.contains('modal-overlay')) closeModal();
  };
});
