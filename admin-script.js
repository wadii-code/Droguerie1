// --- ORDERS SECTION: Render all orders in the orders table ---
function renderOrdersTable() {
    const ordersTableBody = document.getElementById('orders-table-body');
    if (!ordersTableBody) return;
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    ordersTableBody.innerHTML = '';
    if (orders.length === 0) {
        ordersTableBody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-gray-400">Aucune commande trouvée.</td></tr>`;
        return;
    }
    orders.forEach(order => {
        // List product names
        let productNames = '';
        if (Array.isArray(order.items)) {
            productNames = order.items.map(item => item.name).join(', ');
        }
        // Total
        const total = order.total ? order.total.toFixed(2) + '€' : '0,00€';
        // Date
        const date = order.date ? new Date(order.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
        // Status (default to 'Complétée' if not present)
        const status = order.status || 'Complétée';
        ordersTableBody.innerHTML += `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">${productNames}</td>
                <td class="px-6 py-4 whitespace-nowrap">${total}</td>
                <td class="px-6 py-4 whitespace-nowrap">${date}</td>
                <td class="px-6 py-4 whitespace-nowrap">${status}</td>
            </tr>
        `;
    });
}
// --- CLIENT MANAGEMENT ---
let clients = JSON.parse(localStorage.getItem('clients')) || [];
const clientsTableBody = document.getElementById('clients-table-body');
const addClientBtn = document.getElementById('add-client-btn');
const clientModal = document.getElementById('client-modal');
const closeClientModal = document.getElementById('close-client-modal');
const clientForm = document.getElementById('client-form');
const clientModalTitle = document.getElementById('client-modal-title');
const clientSearch = document.getElementById('client-search');
let clientToEdit = null;

function renderClientsTable(filteredClients = clients) {
    clientsTableBody.innerHTML = '';
    if (filteredClients.length === 0) {
        clientsTableBody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-gray-400">Aucun client trouvé.</td></tr>`;
        return;
    }
    filteredClients.forEach(client => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${client.name}</td>
            <td class="px-6 py-4 whitespace-nowrap">${client.email}</td>
            <td class="px-6 py-4 whitespace-nowrap">${client.phone || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap">${client.orderCount || 0}</td>
            <td class="px-6 py-4 whitespace-nowrap">${client.totalSpent ? client.totalSpent.toFixed(2) + '€' : '0,00€'}</td>
            <td class="px-6 py-4 whitespace-nowrap">${client.lastActivity ? new Date(client.lastActivity).toLocaleDateString('fr-FR') : 'Aucune'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="edit-client text-blue-600 hover:text-blue-900 mr-3" data-id="${client.id}"><i class="fas fa-edit"></i></button>
                <button class="delete-client text-red-600 hover:text-red-900" data-id="${client.id}"><i class="fas fa-trash"></i></button>
            </td>`;
        clientsTableBody.appendChild(row);
    });
    // Add event listeners
    document.querySelectorAll('.edit-client').forEach(btn => {
        btn.addEventListener('click', e => openEditClientModal(parseInt(e.currentTarget.dataset.id)));
    });
    document.querySelectorAll('.delete-client').forEach(btn => {
        btn.addEventListener('click', e => deleteClient(parseInt(e.currentTarget.dataset.id)));
    });
}

function openAddClientModal() {
    clientModalTitle.textContent = 'Ajouter un client';
    clientForm.reset();
    document.getElementById('client-id').value = '';
    clientToEdit = null;
    clientModal.classList.remove('hidden');
    setTimeout(() => clientModal.classList.add('show'), 10);
}

function openEditClientModal(id) {
    const client = clients.find(c => c.id === id);
    if (!client) return;
    clientModalTitle.textContent = 'Modifier le client';
    document.getElementById('client-id').value = client.id;
    document.getElementById('client-name').value = client.name;
    document.getElementById('client-email').value = client.email;
    document.getElementById('client-phone').value = client.phone || '';
    clientToEdit = id;
    clientModal.classList.remove('hidden');
    setTimeout(() => clientModal.classList.add('show'), 10);
}

function closeClientModalFn() {
    clientModal.classList.remove('show');
    setTimeout(() => clientModal.classList.add('hidden'), 300);
}

function saveClient(clientData, id) {
    if (id) {
        const idx = clients.findIndex(c => c.id === parseInt(id));
        if (idx !== -1) clients[idx] = { ...clients[idx], ...clientData };
    } else {
        const newId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1;
        clients.push({ id: newId, ...clientData });
    }
    localStorage.setItem('clients', JSON.stringify(clients));
    renderClientsTable(getFilteredClients());
}

function deleteClient(id) {
    if (confirm('Supprimer ce client ?')) {
        clients = clients.filter(c => c.id !== id);
        localStorage.setItem('clients', JSON.stringify(clients));
        renderClientsTable(getFilteredClients());
    }
}

clientForm.addEventListener('submit', e => {
    e.preventDefault();
    const id = document.getElementById('client-id').value;
    const name = document.getElementById('client-name').value.trim();
    const email = document.getElementById('client-email').value.trim();
    const phone = document.getElementById('client-phone').value.trim();
    if (!name || !email) {
        alert('Nom et email sont obligatoires.');
        return;
    }
    saveClient({ name, email, phone }, id);
    closeClientModalFn();
});

addClientBtn.addEventListener('click', openAddClientModal);
closeClientModal.addEventListener('click', closeClientModalFn);
document.getElementById('cancel-client-form').addEventListener('click', closeClientModalFn);

clientSearch.addEventListener('input', () => {
    renderClientsTable(getFilteredClients());
});

function getFilteredClients() {
    const term = clientSearch.value.toLowerCase();
    if (!term) return clients;
    return clients.filter(c => c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term));
}

// Aggregate order data for reporting
function updateClientOrderStats() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    clients.forEach(client => {
        const clientOrders = orders.filter(o => o.email && o.email === client.email);
        client.orderCount = clientOrders.length;
        client.totalSpent = clientOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        client.lastActivity = clientOrders.length > 0 ? clientOrders[clientOrders.length - 1].date : null;
    });
    localStorage.setItem('clients', JSON.stringify(clients));
}

// Initial render
document.addEventListener('DOMContentLoaded', () => {
    updateClientOrderStats();
    renderClientsTable();
    renderOrdersTable();
});
// THEME: Global theme selector logic
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('theme-dark');
    } else {
        document.body.classList.remove('theme-dark');
    }
}

function setTheme(theme) {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
    // Update radio buttons if present
    const lightRadio = document.getElementById('theme-light');
    const darkRadio = document.getElementById('theme-dark');
    if (lightRadio && darkRadio) {
        lightRadio.checked = theme === 'light';
        darkRadio.checked = theme === 'dark';
    }
}

function initThemeSelector() {
    const lightRadio = document.getElementById('theme-light');
    const darkRadio = document.getElementById('theme-dark');
    if (!lightRadio || !darkRadio) return;
    lightRadio.addEventListener('change', () => setTheme('light'));
    darkRadio.addEventListener('change', () => setTheme('dark'));
    // On load, set UI to current theme
    const saved = localStorage.getItem('theme') || 'light';
    setTheme(saved);
}

// Apply theme ASAP on DOMContentLoaded to prevent FOUC
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    setTimeout(initThemeSelector, 0); // Wait for DOM
});
// Simple auth password (demo only)
const ADMIN_PASSWORD = 'admin123';

// DOM Elements
const loginModal = document.getElementById('login-modal');
const loginForm = document.getElementById('login-form');
const mainContent = document.getElementById('main-content');
const mainArea = document.getElementById('main-area');
const productsTableBody = document.getElementById('products-table-body');
const productModal = document.getElementById('product-modal');
const deleteModal = document.getElementById('delete-modal');
const productForm = document.getElementById('product-form');
const modalTitle = document.getElementById('modal-title');
const productSearch = document.getElementById('product-search');
const categoryFilter = document.getElementById('category-filter');
const statusFilter = document.getElementById('status-filter');
let productToDelete = null;
let currentPage = 1;
const itemsPerPage = 10;

// Load products from localStorage, or initialize with demo data if empty
let products = JSON.parse(localStorage.getItem('products'));
if (!products || products.length === 0) {
    products = [
        {
            id: 1,
            name: "Peinture acrylique blanche",
            category: "peinture",
            description: "10L - Couvrance exceptionnelle",
            price: 32.50,
            stock: 45,
            status: "active",
            image: "https://images.unsplash.com/photo-1575505586569-646b2ca898fc?ixlib=rb-4.0.3"
        },
        {
            id: 2,
            name: "Kit nettoyage multi-surfaces",
            category: "nettoyage",
            description: "5 produits essentiels - Écologiques",
            price: 24.90,
            stock: 32,
            status: "active",
            image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?ixlib=rb-4.0.3"
        },
        {
            id: 3,
            name: "Kit vis et chevilles",
            category: "quincaillerie",
            description: "150 pièces - Toutes dimensions",
            price: 14.99,
            stock: 78,
            status: "promo",
            image: "https://images.unsplash.com/photo-1586981953108-0c23bd5b3e0e?ixlib=rb-4.0.3"
        }
    ];
    localStorage.setItem('products', JSON.stringify(products));
}

// Auth handling
function showLogin() {
    loginModal.style.display = 'flex';
}

function hideLogin() {
    loginModal.style.display = 'none';
    document.getElementById('password').value = '';
}

function showMain() {
    mainContent.style.display = 'block';
    mainArea.style.display = 'block';
}

function hideMain() {
    mainContent.style.display = 'none';
    mainArea.style.display = 'none';
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    if (password === ADMIN_PASSWORD) {
        hideLogin();
        showMain();
        renderProductsTable();
        initNavigation();
    } else {
        alert('Mot de passe incorrect!');
    }
});

// Navigation
function initNavigation() {
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href').substring(1);
            document.querySelectorAll('section').forEach(sec => sec.classList.add('hidden'));
            if (document.getElementById(target)) {
                document.getElementById(target).classList.remove('hidden');
                // If orders section, render orders
                if (target === 'orders') {
                    renderOrdersTable();
                }
            }
        });
    });
}

// Render products table with pagination, search, filter
function renderProductsTable(filteredProducts = products) {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedProducts = filteredProducts.slice(start, end);
    
    productsTableBody.innerHTML = '';
    
    paginatedProducts.forEach(product => {
        const row = document.createElement('tr');
        row.className = 'table-row';
        
        // Status badge
        let statusClass = '';
        let statusText = '';
        switch(product.status) {
            case 'active':
                statusClass = 'bg-green-100 text-green-800';
                statusText = 'Actif';
                break;
            case 'inactive':
                statusClass = 'bg-red-100 text-red-800';
                statusText = 'Inactif';
                break;
            case 'promo':
                statusClass = 'bg-yellow-100 text-yellow-800';
                statusText = 'Promo';
                break;
            default:
                statusClass = 'bg-gray-100 text-gray-800';
                statusText = 'Inconnu';
        }
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                        <img class="h-10 w-10 rounded-md object-cover" src="${product.image || 'https://via.placeholder.com/40'}" alt="${product.name}" loading="lazy">
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${product.name}</div>
                        <div class="text-sm text-gray-500">${product.description || ''}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 capitalize">${product.category}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${product.price.toFixed(2)}€</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${product.stock}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                    ${statusText}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="edit-product text-blue-600 hover:text-blue-900 mr-3" data-id="${product.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-product text-red-600 hover:text-red-900" data-id="${product.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        productsTableBody.appendChild(row);
    });
    
    // Add event listeners
    document.querySelectorAll('.edit-product').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.currentTarget.getAttribute('data-id'));
            openEditModal(productId);
        });
    });
    
    document.querySelectorAll('.delete-product').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.currentTarget.getAttribute('data-id'));
            openDeleteModal(productId);
        });
    });
    
    // Update pagination
    updatePagination(filteredProducts.length);
}

// Update pagination UI
function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    document.getElementById('page-info').textContent = `Page ${currentPage} sur ${totalPages}`;
    document.getElementById('items-count').textContent = Math.min(start + 1, totalItems);
    document.getElementById('items-total').textContent = Math.min(end, totalItems);
    document.getElementById('total-products').textContent = totalItems;
    
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

// Pagination events
document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderProductsTable(getFilteredProducts());
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    const filtered = getFilteredProducts();
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderProductsTable(filtered);
    }
});

// Search and filter
function getFilteredProducts() {
    let filtered = products;
    
    // Search
    const searchTerm = productSearch.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm) || 
            p.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Category filter
    const category = categoryFilter.value;
    if (category) {
        filtered = filtered.filter(p => p.category === category);
    }
    
    // Status filter
    const status = statusFilter.value;
    if (status) {
        filtered = filtered.filter(p => p.status === status);
    }
    
    return filtered;
}

// Event listeners for filters
productSearch.addEventListener('input', () => {
    currentPage = 1;
    renderProductsTable(getFilteredProducts());
});

categoryFilter.addEventListener('change', () => {
    currentPage = 1;
    renderProductsTable(getFilteredProducts());
});

statusFilter.addEventListener('change', () => {
    currentPage = 1;
    renderProductsTable(getFilteredProducts());
});

// ...existing code...

// Open modal for adding a new product
function openAddModal() {
    modalTitle.textContent = 'Ajouter un produit';
    productForm.reset();
    document.getElementById('product-id').value = '';
    productModal.classList.remove('hidden');
    setTimeout(() => {
        productModal.classList.add('show');
    }, 10);
}

// Open modal for editing a product
function openEditModal(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        modalTitle.textContent = 'Modifier le produit';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-status').value = product.status || 'active';
        // Set image URL input and preview
        document.getElementById('product-image-url').value = product.image || '';
        const previewImg = document.getElementById('preview-img');
        if (product.image) {
            previewImg.src = product.image;
            previewImg.classList.remove('hidden');
        } else {
            previewImg.classList.add('hidden');
        }
        // Clear file input
        document.getElementById('product-image').value = '';
        productModal.classList.remove('hidden');
        setTimeout(() => {
            productModal.classList.add('show');
        }, 10);
    }
}

// Open delete confirmation modal
function openDeleteModal(productId) {
    productToDelete = productId;
    deleteModal.classList.remove('hidden');
    setTimeout(() => {
        deleteModal.classList.add('show');
    }, 10);
}

// Handle form submission with validation
productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const productId = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value.trim();
    const category = document.getElementById('product-category').value;
    const description = document.getElementById('product-description').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const stock = parseInt(document.getElementById('product-stock').value);
    const status = document.getElementById('product-status').value;
    const fileInput = document.getElementById('product-image');
    const urlInput = document.getElementById('product-image-url');
    const previewImg = document.getElementById('preview-img');
    // Validation
    if (!name || !category || isNaN(price) || price <= 0 || isNaN(stock) || stock < 0) {
        alert('Veuillez remplir correctement tous les champs obligatoires.');
        return;
    }
    // Determine image: file > url > preview > placeholder
    let image = '';
    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        if (file.size > 5 * 1024 * 1024) {
            alert("L'image ne doit pas dépasser 5MB.");
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            image = e.target.result;
            saveProduct({ name, category, description, price, stock, status, image }, productId);
        };
        reader.readAsDataURL(file);
        return; // async, so exit here
    } else if (urlInput.value && urlInput.value.trim() !== '') {
        image = urlInput.value.trim();
    } else if (previewImg && previewImg.src && !previewImg.classList.contains('hidden')) {
        image = previewImg.src;
    } else {
        image = 'https://via.placeholder.com/300x200?text=No+Image';
    }
    saveProduct({ name, category, description, price, stock, status, image }, productId);
    function saveProduct(productData, id) {
        if (id) {
            const index = products.findIndex(p => p.id === parseInt(id));
            if (index !== -1) {
                products[index] = { ...products[index], ...productData };
            }
        } else {
            const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            products.push({ id: newId, ...productData });
        }
        localStorage.setItem('products', JSON.stringify(products));
        renderProductsTable(getFilteredProducts());
        productModal.classList.remove('show');
        setTimeout(() => productModal.classList.add('hidden'), 300);
        productForm.reset();
        previewImg.classList.add('hidden');
        urlInput.value = '';
    }
});

// File preview
document.getElementById('product-image').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const previewImg = document.getElementById('preview-img');
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            previewImg.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    } else {
        previewImg.classList.add('hidden');
    }
});

// Handle delete confirmation
document.getElementById('confirm-delete').addEventListener('click', () => {
    if (productToDelete !== null) {
        products = products.filter(p => p.id !== productToDelete);
        localStorage.setItem('products', JSON.stringify(products));
        renderProductsTable(getFilteredProducts());
        deleteModal.style.display = 'none';
        productToDelete = null;
    }
});

// Event listeners for modal controls
document.getElementById('add-product-btn').addEventListener('click', openAddModal);

document.getElementById('close-modal').addEventListener('click', () => {
    productModal.classList.remove('show');
    setTimeout(() => {
        productModal.classList.add('hidden');
    }, 300);
});

document.getElementById('cancel-form').addEventListener('click', () => {
    productModal.classList.remove('show');
    setTimeout(() => {
        productModal.classList.add('hidden');
    }, 300);
});

document.getElementById('cancel-delete').addEventListener('click', () => {
    deleteModal.classList.remove('show');
    setTimeout(() => {
        deleteModal.classList.add('hidden');
        productToDelete = null;
    }, 300);
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === productModal) {
        productModal.classList.remove('show');
        setTimeout(() => {
            productModal.classList.add('hidden');
        }, 300);
    }
    if (e.target === deleteModal) {
        deleteModal.classList.remove('show');
        setTimeout(() => {
            deleteModal.classList.add('hidden');
            productToDelete = null;
        }, 300);
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const directOrder = sessionStorage.getItem('directOrder');
    if (directOrder === 'true') {
        sessionStorage.removeItem('directOrder');
        hideLogin();
        showMain();
        window.location.hash = 'orders';
        route();
        initNavigation();
    } else {
        hideMain();
        const directOrder = sessionStorage.getItem('directOrder');
        if (directOrder === 'true') {
            sessionStorage.removeItem('directOrder');
            hideLogin();
            showMain();
            window.location.hash = 'orders';
            route();
            initNavigation();
        } else {
            hideMain();
            const directOrder = sessionStorage.getItem('directOrder');
            if (directOrder === 'true') {
                sessionStorage.removeItem('directOrder');
                hideLogin();
                showMain();
                window.location.hash = 'orders';
                route();
                initNavigation();
            } else {
                hideMain();
                const directOrder = sessionStorage.getItem('directOrder');
                if (directOrder === 'true') {
                    sessionStorage.removeItem('directOrder');
                    hideLogin();
                    showMain();
                    window.location.hash = 'orders';
                    route();
                    initNavigation();
                } else {
                    hideMain();
                    showLogin();
                }
            }
        }
    }
    
    // Add animation to table rows on render
    const animateRows = () => {
        document.querySelectorAll('tr').forEach((row, index) => {
            row.style.opacity = '0';
            row.style.transform = 'translateX(-20px)';
            setTimeout(() => {
                row.style.transition = 'all 0.5s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateX(0)';
            }, 100 * index);
        });
    };
    
    // Listen for renders to animate
    const observer = new MutationObserver(() => {
        animateRows();
    });
    observer.observe(productsTableBody, { childList: true });
    observer.observe(ordersTableBody, { childList: true });
    
    // Add loading animation to buttons
    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            e.target.classList.add('pulse');
            setTimeout(() => e.target.classList.remove('pulse'), 500);
        }
    });
});