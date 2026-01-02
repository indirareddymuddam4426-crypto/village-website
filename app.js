// Initial Dummy Data
const initialData = [
    { id: 1, name: "Fresh Milk", price: 60, category: "Milk", seller: "Ramesh", stock: 10 },
    { id: 2, name: "Tomatoes", price: 30, category: "Vegetables", seller: "Sita", stock: 20 },
    { id: 3, name: "Bananas", price: 40, category: "Fruits", seller: "Gopal", stock: 15 },
    { id: 4, name: "Wheat (1kg)", price: 45, category: "Farming", seller: "Mohan", stock: 5 },
    { id: 5, name: "Spinach", price: 20, category: "Vegetables", seller: "Lakshmi", stock: 8 },
    // New Out-of-Stock Items
    { id: 6, name: "Alphanso Mangoes", price: 600, category: "Fruits", seller: "Ratna", stock: 0 },
    { id: 7, name: "Mustard Seeds", price: 80, category: "Farming", seller: "Kisan", stock: 0 },
    { id: 8, name: "Goat Cheese", price: 300, category: "Milk", seller: "Ramesh", stock: 0 },
    { id: 9, name: "Red Chilies", price: 120, category: "Farming", seller: "Lakshmi", stock: 0 }
];

// State Management
let items = JSON.parse(localStorage.getItem('villageMarketItems')) || initialData;

// Migration: Ensure all initialData exists
initialData.forEach(initItem => {
    if (!items.find(i => i.id === initItem.id)) {
        items.push(initItem);
    }
});

// Migration for existing data
items.forEach(item => {
    if (item.stock === undefined) item.stock = 10;
});
localStorage.setItem('villageMarketItems', JSON.stringify(items));

let cart = JSON.parse(localStorage.getItem('villageMarketCart')) || [];
let currentUser = null; // Track logged-in seller

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const filterBtns = document.querySelectorAll('.filter-btn');

// Modals
const addItemModal = document.getElementById('addItemModal');
const cartModal = document.getElementById('cartModal');
const checkoutModal = document.getElementById('checkoutModal');
const updateStockModal = document.getElementById('updateStockModal');
const loginModal = document.getElementById('loginModal');

// Buttons (Header)
const openModalBtn = document.getElementById('openModalBtn');
const openCartBtn = document.getElementById('openCartBtn');
const sellerLoginBtn = document.getElementById('sellerLoginBtn');
const sellerLogoutBtn = document.getElementById('sellerLogoutBtn');

// Buttons (Close)
const closeModalBtn = document.querySelector('.close-btn');
const closeCartBtn = document.querySelector('.close-cart');
const closeCheckoutBtn = document.querySelector('.close-checkout');
const closeUpdateStockBtn = document.querySelector('.close-update-stock');
const closeLoginBtn = document.querySelector('.close-login');
const checkoutBtn = document.getElementById('checkoutBtn');

// Forms
const addItemForm = document.getElementById('addItemForm');
const checkoutForm = document.getElementById('checkoutForm');
const updateStockForm = document.getElementById('updateStockForm');
const loginForm = document.getElementById('loginForm');

// Other
const cartBadge = document.getElementById('cartBadge');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const checkoutTotalElement = document.getElementById('checkoutTotal');
const sellerInfo = document.getElementById('sellerInfo');
const welcomeMsg = document.getElementById('welcomeMsg');
const sellerDashboard = document.getElementById('sellerDashboard');
const dashboardGrid = document.getElementById('dashboardGrid');

// Helper: Get Category Icon
const getCategoryIcon = (category) => {
    switch (category) {
        case 'Farming': return '🌾';
        case 'Milk': return '🥛';
        case 'Vegetables': return '🥦';
        case 'Fruits': return '🍎';
        default: return '📦';
    }
};

// Helper: Get Stock Status Class and Text
const getStockStatus = (stock) => {
    if (stock === 0) return { class: 'out-of-stock', text: 'Out of Stock' };
    if (stock < 5) return { class: 'low-stock', text: `Only ${stock} left` };
    return { class: 'in-stock', text: `${stock} Available` };
};

// Render Item Card
const createProductCard = (item) => {
    const stockStatus = getStockStatus(item.stock);
    const isOutOfStock = item.stock === 0;
    const canEdit = currentUser && item.seller.toLowerCase() === currentUser.toLowerCase();

    return `
        <div class="product-card ${isOutOfStock ? 'disabled' : ''}">
            <div class="card-header">
                <div class="category-icon">${getCategoryIcon(item.category)}</div>
                <div class="product-price">₹${item.price}</div>
            </div>
            <div>
                <div class="stock-row">
                    <span class="stock-status ${stockStatus.class}">${stockStatus.text}</span>
                    ${canEdit ? `
                    <button class="btn-edit-stock" onclick="openUpdateStock(${item.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>` : ''}
                </div>
                <h3 class="product-name">${item.name}</h3>
                <div class="seller-info">
                    <i class="fas fa-user-circle"></i>
                    <span>Sold by ${item.seller}</span>
                </div>
                <button class="btn-add-cart ${isOutOfStock ? 'btn-disabled' : ''}" 
                    onclick="${isOutOfStock ? '' : [addToCart(${item.id})](cci:1://file:///Users/indira/village-market/app.js:173:0-200:2)}" 
                    ${isOutOfStock ? 'disabled' : ''}>
                    <i class="fas fa-cart-plus"></i> ${isOutOfStock ? 'No Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>
    `;
};

// Render Main Grid
const renderItems = (category = 'All') => {
    productsGrid.innerHTML = '';

    const filteredItems = category === 'All'
        ? items
        : items.filter(item => item.category === category);

    if (filteredItems.length === 0) {
        productsGrid.innerHTML = '<div style="text-align:center; grid-column: 1/-1; padding: 2rem; color: #6B7280;">No items found in this category.</div>';
        return;
    }

    filteredItems.forEach(item => {
        const card = document.createElement('div');
        // card.className = 'product-card...'; // managed in createProductCard, wait.
        // Actually createProductCard returns string.
        card.innerHTML = createProductCard(item);
        // Unwrap the div
        productsGrid.appendChild(card.firstElementChild);
    });
};

// Render Dashboard
const renderDashboard = () => {
    if (!currentUser) {
        sellerDashboard.style.display = 'none';
        return;
    }

    sellerDashboard.style.display = 'block';
    dashboardGrid.innerHTML = '';

    const myItems = items.filter(item => item.seller.toLowerCase() === currentUser.toLowerCase());

    if (myItems.length === 0) {
        dashboardGrid.innerHTML = '<div style="text-align:center; grid-column: 1/-1; padding: 1rem; color: #6B7280;">You have no listed items.</div>';
    } else {
        myItems.forEach(item => {
            const card = document.createElement('div');
            card.innerHTML = createProductCard(item);
            dashboardGrid.appendChild(card.firstElementChild);
        });
    }
};

// Cart Logic
window.addToCart = (id) => {
    const item = items.find(i => i.id === id);
    const existingItem = cart.find(i => i.id === id);
    const currentQty = existingItem ? existingItem.quantity : 0;

    if (currentQty + 1 > item.stock) {
        alert(`Sorry, we only have ${item.stock} of ${item.name} available.`);
        return;
    }

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }

    updateCart();

    const btn = document.activeElement;
    if (btn && btn.classList.contains('btn-add-cart')) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Added';
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 1000);
    }
};

window.changeQuantity = (id, change) => {
    const itemIndex = cart.findIndex(i => i.id === id);
    if (itemIndex > -1) {
        const item = items.find(i => i.id === id);
        const newQty = cart[itemIndex].quantity + change;

        if (newQty > item.stock) {
            alert(`Cannot add more than ${item.stock} items.`);
            return;
        }

        cart[itemIndex].quantity = newQty;

        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        updateCart();
    }
};

window.removeFromCart = (id) => {
    cart = cart.filter(item => item.id !== id);
    updateCart();
};

const updateCart = () => {
    localStorage.setItem('villageMarketCart', JSON.stringify(cart));
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalCount;
    cartBadge.style.display = totalCount > 0 ? 'flex' : 'none';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your cart is empty</div>';
        checkoutBtn.disabled = true;
        cartTotalElement.innerText = '₹0';
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>Price: ₹${item.price}</p>
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="changeQuantity(${item.id}, -1)"><i class="fas fa-minus"></i></button>
                        <span class="qty-text">${item.quantity}</span>
                        <button class="qty-btn" onclick="changeQuantity(${item.id}, 1)"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <strong class="item-total">₹${item.price * item.quantity}</strong>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        `).join('');
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalElement.innerText = `₹${total}`;
        checkoutBtn.disabled = false;
    }
};

// Stock Update Logic
window.openUpdateStock = (id) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    document.getElementById('updateStockId').value = item.id;
    document.getElementById('updateItemName').value = item.name;
    document.getElementById('newStockQty').value = item.stock;

    toggleModal(updateStockModal, true);
};

updateStockForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = Number(document.getElementById('updateStockId').value);
    const newStock = Number(document.getElementById('newStockQty').value);

    const itemIndex = items.findIndex(i => i.id === id);
    if (itemIndex > -1) {
        items[itemIndex].stock = newStock;
        localStorage.setItem('villageMarketItems', JSON.stringify(items));

        // Re-render
        renderCurrentView();
        toggleModal(updateStockModal, false);
    }
});

// Auth Logic
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('loginName').value.trim();
    if (name) {
        currentUser = name;
        welcomeMsg.textContent = `Welcome, ${name}`;

        sellerLoginBtn.style.display = 'none';
        sellerInfo.style.display = 'flex';

        openModalBtn.style.display = 'block'; // Ensure Sell Item is visible

        toggleModal(loginModal, false);
        loginForm.reset();

        renderCurrentView();
    }
});

sellerLogoutBtn.addEventListener('click', () => {
    currentUser = null;
    sellerLoginBtn.style.display = 'block';
    sellerInfo.style.display = 'none';

    renderCurrentView();
});

sellerLoginBtn.addEventListener('click', () => toggleModal(loginModal, true));
closeLoginBtn.addEventListener('click', () => toggleModal(loginModal, false));

// Helper to rerender everything
const renderCurrentView = () => {
    const activeCategory = document.querySelector('.filter-btn.active').dataset.category;
    renderItems(activeCategory);
    renderDashboard();
};

// Modal Helper
const toggleModal = (modal, show) => {
    if (show) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
    } else {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
};

// Event Listeners
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderItems(btn.dataset.category);
    });
});

openModalBtn.addEventListener('click', () => toggleModal(addItemModal, true));
closeModalBtn.addEventListener('click', () => {
    toggleModal(addItemModal, false);
    addItemForm.reset();
});

openCartBtn.addEventListener('click', () => {
    updateCart();
    toggleModal(cartModal, true);
});
closeCartBtn.addEventListener('click', () => toggleModal(cartModal, false));

checkoutBtn.addEventListener('click', () => {
    toggleModal(cartModal, false);
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    checkoutTotalElement.innerText = `₹${total}`;
    toggleModal(checkoutModal, true);
});
closeCheckoutBtn.addEventListener('click', () => toggleModal(checkoutModal, false));
closeUpdateStockBtn.addEventListener('click', () => toggleModal(updateStockModal, false));

// Close on outside click
window.addEventListener('click', (e) => {
    if (e.target === addItemModal) toggleModal(addItemModal, false);
    if (e.target === cartModal) toggleModal(cartModal, false);
    if (e.target === checkoutModal) toggleModal(checkoutModal, false);
    if (e.target === updateStockModal) toggleModal(updateStockModal, false);
    if (e.target === loginModal) toggleModal(loginModal, false);
});

// Add Item Form
addItemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newItem = {
        id: Date.now(),
        name: document.getElementById('itemName').value,
        price: Number(document.getElementById('itemPrice').value),
        category: document.getElementById('itemCategory').value,
        seller: document.getElementById('sellerName').value,
        stock: Number(document.getElementById('itemStock').value)
    };
    items.unshift(newItem);
    localStorage.setItem('villageMarketItems', JSON.stringify(items));

    // Switch to user if matched? optional.

    filterBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('[data-category="All"]').classList.add('active');
    renderCurrentView();

    toggleModal(addItemModal, false);
    addItemForm.reset();
});

// Checkout Form
checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    cart.forEach(cartItem => {
        const itemIndex = items.findIndex(i => i.id === cartItem.id);
        if (itemIndex > -1) {
            items[itemIndex].stock -= cartItem.quantity;
            if (items[itemIndex].stock < 0) items[itemIndex].stock = 0;
        }
    });
    localStorage.setItem('villageMarketItems', JSON.stringify(items));

    alert(`Thank you, ${document.getElementById('buyerName').value}! Your order will be delivered to ${document.getElementById('buyerVillage').value}.`);

    cart = [];
    updateCart();
    toggleModal(checkoutModal, false);
    checkoutForm.reset();

    renderCurrentView();
});

// Initial Init
renderItems();
updateCart();
renderDashboard();
