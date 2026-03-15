/* Home Page Script with Fakestore API Integration */

// Global state
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

// Wait for DOM load
document.addEventListener('DOMContentLoaded', function() {
    // Select elements
    const main = document.querySelector('.products-container');
    const loginBtn = document.getElementById('loginBtn');
    const userMenu = document.getElementById('userMenu');
    const logoutBtn = document.getElementById('logoutBtn');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const loginMiniWindow = document.getElementById('loginMiniWindow');
    const cancelBtn = document.getElementById('canclebtn'); // Note: typo in HTML, using ID as-is
    const loginFormBtn = document.getElementById('loginbtn');
    const emailInput = loginMiniWindow.querySelector('input[type=\"email\"]');
    const passwordInput = loginMiniWindow.querySelector('input[type=\"password\"]');

    // Utility: Check if logged in (mock simple auth)
    function isLoggedIn() {
        return localStorage.getItem('user') !== null;
    }

    // Show login modal
    function showModal() {
        modalBackdrop.classList.remove('hidden');
        modalBackdrop.classList.add('active');
        loginMiniWindow.classList.remove('hidden');
        loginMiniWindow.classList.add('active');
    }

    // Hide login modal
    function hideModal() {
        modalBackdrop.classList.remove('active');
        modalBackdrop.classList.add('hidden');
        loginMiniWindow.classList.remove('active');
        loginMiniWindow.classList.add('hidden');
        // Clear form
        emailInput.value = '';
        passwordInput.value = '';
    }

    // Update UI based on login state
    function updateAuthUI() {
        if (isLoggedIn()) {
            loginBtn.classList.add('hidden');
            userMenu.classList.remove('hidden');
        } else {
            loginBtn.classList.remove('hidden');
            userMenu.classList.add('hidden');
        }
    }

    // Event listeners for auth
    loginBtn.addEventListener('click', showModal);
    
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('user');
        updateAuthUI();
    });

    // Modal close handlers
    cancelBtn.addEventListener('click', hideModal);
    modalBackdrop.addEventListener('click', hideModal);

    // Login form (mock: accept any email/pass)
    loginFormBtn.addEventListener('click', function() {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        if (email && password) {
            localStorage.setItem('user', JSON.stringify({ email }));
            updateAuthUI();
            hideModal();
            // Optional: show success
            alert('Logged in successfully!');
        } else {
            alert('Please enter email and password');
        }
    });

    // Make functions accessible globally for onclick handlers
    window.isLoggedIn = isLoggedIn;
    window.showModal = showModal;

    // Initial UI update
    updateAuthUI();

    // Product fetching - now ready
    getData(main);
});

/**
 * Fetch products from EscuelaJS API
 * @param {HTMLElement} container - Where to display
 */
async function getData(container) {
    try {
        // Show loader
        container.innerHTML = `
            <div class="loader">
                <div class="spinner"></div>
                <p>Loading products...</p>
            </div>
        `;

const rec = await fetch("https://fakestoreapi.com/products");
        if (!rec.ok) {
            throw new Error(`HTTP ${rec.status}: ${rec.statusText}`);
        }
        const data = await rec.json();
        displayData(data, container);
    } catch (error) {
        console.error('Fetch error:', error);
        container.innerHTML = `
            <div class="error-message">
                <h3>Failed to load products</h3>
                <p>${error.message}</p>
                <button onclick="getData(this.parentElement.parentElement)">Retry</button>
            </div>
        `;
    }
}

/**
 * Display products as cards
 * @param {Array} data - Products array
 * @param {HTMLElement} container - Where to append
 */
function displayData(data, container) {
    // Clear loader/error
    container.innerHTML = '';

    data.forEach(p => {
        const card = document.createElement("div");
        card.classList.add("product-card");

// Image with fallback
        const imgSrc = p.image || 'https://via.placeholder.com/300x200?text=No+Image';
        card.innerHTML = `
            <img src="${imgSrc}" alt="${p.title}" class="product-image" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
            <div class="product-info">
                <h3 class="product-title">${p.title.length > 50 ? p.title.slice(0, 50) + '...' : p.title}</h3>
<span class="category-badge">${p.category ? p.category.name || p.category : 'General'}</span>
                <p class="product-description">${p.description.length > 100 ? p.description.slice(0, 100) + '...' : p.description}</p>
                <div class="product-price">₹${parseFloat(p.price).toFixed(2)}</div>
            </div>
        `;

        const btn = document.createElement("button");
        btn.classList.add("product-btn");
        btn.innerText = "Add To Cart";
        btn.onclick = () => {
            // No login required per user request
            const cartItem = { 
                id: p.id,
                title: p.title, 
                price: p.price,
                image: p.image,
                description: p.description,
                category: p.category,
                qty: 1 
            };
            cartItems.push(cartItem);
            localStorage.setItem("cartItems", JSON.stringify(cartItems));
            alert("Item added to cart!");
        };

        card.appendChild(btn);
        container.appendChild(card);
    });
}

