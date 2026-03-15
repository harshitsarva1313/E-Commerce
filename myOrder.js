// My Order page script
// Handles orders display, profile editing, status updates, bill download

// Mock delivery persons
const deliveryPersons = [
  { name: 'John Delivery', phone: '+1234567890', avatar: 'JD' },
  { name: 'Sarah Express', phone: '+1987654321', avatar: 'SE' },
  { name: 'Mike Fast', phone: '+1122334455', avatar: 'MF' }
];

// Status progression
const statusOrder = ['placed', 'processing', 'shipping', 'delivered'];
const completedStatuses = ['delivered'];
const currentStatuses = ['placed', 'processing', 'shipping'];

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const profileBtn = document.getElementById('profileBtn');
    const userInfo = document.getElementById('userInfo');
    const loginPrompt = document.getElementById('loginPrompt');
    const currentOrdersEl = document.getElementById('currentOrders');
    const completedOrdersEl = document.getElementById('completedOrders');
    const noCurrentEl = document.getElementById('noCurrent');
    const noCompletedEl = document.getElementById('noCompleted');

    // Load data
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    let user = JSON.parse(localStorage.getItem('user') || '{}');

    // Update UI
    function updateUI() {
        user = JSON.parse(localStorage.getItem('user') || '{}');
        orders = JSON.parse(localStorage.getItem('orders') || '[]');

        // Profile section
        if (Object.keys(user).length > 0) {
            loginPrompt.classList.add('hidden');
            userInfo.textContent = `Hi, ${user.email || user.name || 'User'}`;
            userInfo.classList.remove('hidden');
            profileBtn.classList.remove('hidden');
        } else {
            loginPrompt.classList.remove('hidden');
            userInfo.classList.add('hidden');
            profileBtn.classList.add('hidden');
        }

        // Filter orders
        const currentOrders = orders.filter(o => currentStatuses.includes(o.status));
        const completedOrders = orders.filter(o => completedStatuses.includes(o.status));

        // Render current
        if (currentOrders.length === 0) {
            noCurrentEl.classList.remove('hidden');
            currentOrdersEl.innerHTML = '';
        } else {
            noCurrentEl.classList.add('hidden');
            currentOrdersEl.innerHTML = renderOrders(currentOrders, true);
        }

        // Render completed
        if (completedOrders.length === 0) {
            noCompletedEl.classList.remove('hidden');
            completedOrdersEl.innerHTML = '';
        } else {
            noCompletedEl.classList.add('hidden');
            completedOrdersEl.innerHTML = renderOrders(completedOrders, false);
        }
    }

    // Render orders list
    function renderOrders(orderList, isCurrent) {
        return orderList.map(order => {
            const type = order.items.map(i => i.category || 'General').join(', ');
            const delivery = deliveryPersons[Math.floor(Math.random() * deliveryPersons.length)];
            
            let actions = `
                <div class="order-actions">
                    <a href="#" class="order-btn btn-detail" onclick="showOrderDetail(${order.id})">
                        <i class="fa-solid fa-eye"></i> Details
                    </a>
                    <button class="order-btn btn-download" onclick="downloadBill(${order.id})">
                        <i class="fa-solid fa-download"></i> Download
                    </button>
            `;

            if (isCurrent) {
                actions += `
                    <button class="order-btn btn-cancel" onclick="cancelOrder(${order.id})">
                        <i class="fa-solid fa-ban"></i> Cancel
                    </button>
                    <button class="order-btn btn-progress" onclick="showProgress(${order.id})">
                        <i class="fa-solid fa-map-marker-alt"></i> Progress
                    </button>
                    <a href="#" class="order-btn btn-message" onclick="showMessage(${order.id}, '${delivery.phone}')">
                        <i class="fa-solid fa-comment"></i> Message
                    </a>
                `;
            }

            actions += '</div>';

            return `
                <article class="order-card">
                    <div>
                        <div class="order-header">
                            <div>
                                <span class="order-id">#${order.id}</span>
                                <span class="order-type">${type}</span>
                            </div>
                            <div class="order-total">$${order.total.toFixed(2)}</div>
                        </div>
                        <div class="order-date">${new Date(order.timestamp).toLocaleString()}</div>
                        <span class="order-status status-${order.status}">${order.status.toUpperCase()}</span>
                        ${isCurrent ? `
                            <div class="progress-section" id="progress-${order.id}" style="display:none;">
                                <div class="progress-labels">
                                    <span>Placed</span>
                                    <span>Processing</span>
                                    <span>Shipping</span>
                                    <span>Delivered</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-step ${getProgressClass(order.status, 0)}"></div>
                                    <div class="progress-step ${getProgressClass(order.status, 1)}"></div>
                                    <div class="progress-step ${getProgressClass(order.status, 2)}"></div>
                                    <div class="progress-step ${getProgressClass(order.status, 3)}"></div>
                                </div>
                                <div class="delivery-info">
                                    <div class="delivery-person">
                                        <div class="delivery-avatar">${delivery.avatar}</div>
                                        <div>
                                            <div>${delivery.name}</div>
                                            <div>Location: En route</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    ${actions}
                </article>
            `;
        }).join('');
    }

    function getProgressClass(status, index) {
        const statusIdx = statusOrder.indexOf(status);
        if (index < statusIdx) return 'completed';
        if (index === statusIdx) return 'current';
        return '';
    }

    // Event listeners
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(this.dataset.tab + '-tab').classList.add('active');
        });
    });

profileBtn.addEventListener('click', showProfileMini);

// Profile mini window handlers
document.getElementById('saveProfileBtn').addEventListener('click', function(e) {
    const email = document.getElementById('editEmail').value.trim();
    const address = document.getElementById('editAddress').value.trim();
    if (!email || !address) {
        alert('Email and Address are required!');
        return;
    }
    user.email = email;
    user.name = document.getElementById('editName').value.trim() || user.name || '';
    user.phone = document.getElementById('editPhone').value.trim() || user.phone || '';
    user.address = address;
    localStorage.setItem('user', JSON.stringify(user));
    hideProfileMini();
    updateUI();
    alert('Profile updated successfully!');
});

document.getElementById('resetProfile').addEventListener('click', function() {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    document.getElementById('editEmail').value = savedUser.email || '';
    document.getElementById('editName').value = savedUser.name || '';
    document.getElementById('editPhone').value = savedUser.phone || '';
    document.getElementById('editAddress').value = savedUser.address || '';
});

document.getElementById('profileCancelBtn').addEventListener('click', hideProfileMini);
document.getElementById('modalBackdropProfile').addEventListener('click', hideProfileMini);

// Other modals close
document.querySelectorAll('[id$="CancelBtn"], [id^="close"], .modal-overlay').forEach(el => {
    el.addEventListener('click', function(e) {
        if (e.target.classList.contains('close-btn') || e.target.classList.contains('modal-overlay') || e.target.id.includes('CancelBtn')) {
            document.querySelectorAll('.modal-overlay, #profileMiniWindow').forEach(m => m.classList.add('hidden'));
            document.getElementById('modalBackdropProfile').classList.add('hidden');
        }
    });
});

    // Init
    updateUI();
});

// Global functions for onclick handlers
function showProfileMini() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    document.getElementById('editEmail').value = user.email || '';
    document.getElementById('editName').value = user.name || '';
    document.getElementById('editPhone').value = user.phone || '';
    document.getElementById('editAddress').value = user.address || '';
    document.getElementById('profileMiniWindow').classList.remove('hidden');
    document.getElementById('profileMiniWindow').classList.add('active');
    document.getElementById('modalBackdropProfile').classList.remove('hidden');
    document.getElementById('modalBackdropProfile').classList.add('active');
}

function hideProfileMini() {
    document.getElementById('profileMiniWindow').classList.add('hidden');
    document.getElementById('profileMiniWindow').classList.remove('active');
    document.getElementById('modalBackdropProfile').classList.add('hidden');
    document.getElementById('modalBackdropProfile').classList.remove('active');
}

function showOrderDetail(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id == orderId);
    if (!order) return;

    document.getElementById('orderTitle').textContent = `Order #${order.id} Details`;
    // Enrich customer with user data
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const fullCustomer = {
        name: savedUser.name || order.customer.name || 'Customer',
        email: savedUser.email || '',
        phone: savedUser.phone || order.customer.phone || '',
        address: savedUser.address || order.customer.address || 'N/A'
    };

    document.getElementById('orderContent').innerHTML = `
        <div class="bill-header">
            <h3>Invoice #${order.id}</h3>
            <div class="bill-date">${new Date(order.timestamp).toLocaleDateString()} ${new Date(order.timestamp).toLocaleTimeString()}</div>
        </div>

        <div class="bill-sections">
            <section class="bill-user">
                <h4><i class="fa-solid fa-user"></i> Customer Details</h4>
                <div class="info-grid">
                    <div><strong>Name:</strong> ${fullCustomer.name}</div>
                    <div><strong>Email:</strong> ${fullCustomer.email}</div>
                    <div><strong>Phone:</strong> ${fullCustomer.phone}</div>
                </div>
            </section>

            <section class="bill-delivery">
                <h4><i class="fa-solid fa-map-marker-alt"></i> Delivery Details</h4>
                <div class="info-grid">
                    <div><strong>Location:</strong> ${fullCustomer.address}</div>
                    <div><strong>Est. Delivery:</strong> ${new Date(order.timestamp).toLocaleDateString()} ${new Date(order.timestamp).toLocaleTimeString()}</div>
                    <div><strong>Status:</strong> <span class="status-badge status-${order.status}">${order.status.toUpperCase()}</span></div>
                </div>
            </section>

            <section class="bill-products">
                <h4><i class="fa-solid fa-boxes"></i> Products</h4>
                <table class="bill-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Product Details</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => {
                            const imgSrc = item.image || 'https://via.placeholder.com/60x60/2563eb/ffffff?text=?';
                            const category = item.category || 'General';
                            return `
                                <tr>
                                    <td><img src="${imgSrc}" alt="${item.title}" class="product-img"></td>
                                    <td>
                                        <div class="product-name">${item.title}</div>
                                        <div class="product-meta">${category} ${item.desc ? '- ' + item.desc : ''}</div>
                                    </td>
                                    <td>${item.qty}</td>
                                    <td>$${item.price.toFixed(2)}</td>
                                    <td>$${(item.price * item.qty).toFixed(2)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </section>

            <section class="bill-payment">
                <h4><i class="fa-solid fa-credit-card"></i> Payment Summary</h4>
                <div class="payment-info">
                    <div><strong>Method:</strong> ${order.payment}${order.emi ? ' (EMI)' : ''}</div>
                    <div class="grand-total">Grand Total: $${order.total.toFixed(2)}</div>
                </div>
            </section>
        </div>
    `;
    document.getElementById('orderModal').classList.remove('hidden');
}

function downloadBill(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id == orderId);
    if (!order) return;
    showOrderDetail(orderId);
    // Delay for modal render, then print
    setTimeout(() => window.print(), 500);
}

function cancelOrder(orderId) {
    if (!confirm('Cancel this order?')) return;
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderIdx = orders.findIndex(o => o.id == orderId);
    if (orderIdx !== -1) {
        orders[orderIdx].status = 'cancelled';
        localStorage.setItem('orders', JSON.stringify(orders));
        location.reload(); // Refresh to update
    }
}

function showProgress(orderId) {
    document.getElementById(`progress-${orderId}`).style.display = 'block';
}

function showMessage(orderId, phone) {
    document.getElementById('deliveryPhone').textContent = phone;
    document.getElementById('deliveryPhone').href = `tel:${phone}`;
    document.getElementById('messageModal').classList.remove('hidden');
    document.getElementById('messageForm').onsubmit = function(e) {
        e.preventDefault();
        alert('Message sent to delivery person! (Mock)');
        document.getElementById('messageModal').classList.add('hidden');
    };
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}
