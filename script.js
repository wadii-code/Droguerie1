// Mobile menu toggle
document.getElementById('mobile-menu-button').addEventListener('click', function() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
});

// Sample initial products (will be saved to localStorage)
let initialProducts = [
    {
        id: 1,
        name: "Perceuse-visseuse 18V",
        category: "outillage",
        description: "Marque ProTool - Batterie incluse",
        price: 89.99,
        image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?ixlib=rb-4.0.3"
    },
    {
        id: 2,
        name: "Peinture acrylique blanche",
        category: "peinture",
        description: "10L - Couvrance exceptionnelle",
        price: 32.50,
        image: "https://images.unsplash.com/photo-1575505586569-646b2ca898fc?ixlib=rb-4.0.3"
    },
    {
        id: 3,
        name: "Kit vis et chevilles",
        category: "quincaillerie",
        description: "150 pièces - Toutes dimensions",
        price: 14.99,
        image: "https://images.unsplash.com/photo-1586981953108-0c23bd5b3e0e?ixlib=rb-4.0.3"
    },
    {
        id: 4,
        name: "Tondeuse électrique 1200W",
        category: "jardinage",
        description: "Largeur de coupe 36cm - Bac 40L",
        price: 149.00,
        image: "https://images.unsplash.com/photo-1598880940080-ff9a2981366e?ixlib=rb-4.0.3"
    },
    {
        id: 5,
        name: "Scie circulaire 1600W",
        category: "outillage",
        description: "Diamètre lame 190mm - Profondeur de coupe 65mm",
        price: 79.90,
        image: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?ixlib=rb-4.0.3"
    },
    {
        id: 6,
        name: "Kit rouleaux et accessoires",
        category: "peinture",
        description: "3 rouleaux + bac + pinceaux",
        price: 22.50,
        image: "https://images.unsplash.com/photo-1518893883327-231d5f16cc32?ixlib=rb-4.0.3"
    },
    {
        id: 7,
        name: "Serrures de sécurité",
        category: "quincaillerie",
        description: "Lot de 3 - Cylindre européen",
        price: 45.00,
        image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?ixlib=rb-4.0.3"
    },
    {
        id: 8,
        name: "Tuyau d'arrosage 25m",
        category: "jardinage",
        description: "Résistant aux UV - Sans plomb",
        price: 29.99,
        image: "https://images.unsplash.com/photo-1598880940080-ff9a2981366e?ixlib=rb-4.0.3"
    }
];

//niggaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

// Load products from localStorage or initialize
let products = JSON.parse(localStorage.getItem('products')) || initialProducts;
localStorage.setItem('products', JSON.stringify(products));

// Shopping cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartCountElements = document.querySelectorAll('.cart-count');
const cartItemsContainer = document.getElementById('cart-items');
const cartSummary = document.getElementById('cart-summary');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartTotal = document.getElementById('cart-total');

// Render products dynamically
function renderProducts() {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card bg-white rounded-lg overflow-hidden shadow-md transition duration-300';
        productCard.dataset.category = product.category;
        productCard.innerHTML = `
            <div class="relative">
                <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover" loading="lazy">
                <span class="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded">Nouveau</span>
            </div>
            <div class="p-4">
                <h3 class="font-bold text-lg mb-1">${product.name}</h3>
                <p class="text-gray-600 text-sm mb-3">${product.description}</p>
                <div class="flex justify-between items-center">
                    <span class="font-bold text-blue-600">${product.price.toFixed(2)}€</span>
                    <button class="add-to-cart bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition duration-300" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">
                        <i class="fas fa-cart-plus mr-1"></i> Ajouter
                    </button>
                </div>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });

    // --- Initialize filtering and cart AFTER rendering products ---
    setupEventListeners();
}

// Product search and filter functionality
function filterProducts() {
    const productSearchFrontend = document.getElementById('product-search-frontend');
    const searchTerm = productSearchFrontend.value.toLowerCase();
    const activeCategoryElement = document.querySelector('.category-btn.active');
    
    // Check if active category element exists to avoid errors
    const activeCategory = activeCategoryElement ? activeCategoryElement.dataset.category : 'all';
    const cards = document.querySelectorAll('.product-card');
    
    cards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        const category = card.dataset.category;
        let show = true;
        
        // Category filter
        if (activeCategory !== 'all' && category !== activeCategory) {
            show = false;
        }
        
        // Search filter
        if (show && searchTerm && !name.includes(searchTerm) && !description.includes(searchTerm)) {
            show = false;
        }
        
        // Apply show/hide with transition
        if (show) {
            card.style.display = 'block';
            // Small timeout to allow the display block to take effect before opacity
            setTimeout(() => { card.style.opacity = '1'; }, 10);
        } else {
            card.style.opacity = '0';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

// Function to set up all event listeners
function setupEventListeners() {
    const productSearchFrontend = document.getElementById('product-search-frontend');
    const categoryBtns = document.querySelectorAll('.category-btn');
    
    // Search input event listener
    if (productSearchFrontend) {
        // Remove any existing listener to avoid duplicates, then add new one
        productSearchFrontend.removeEventListener('input', filterProducts);
        productSearchFrontend.addEventListener('input', filterProducts);
    }
    
    // Category button event listeners
    if (categoryBtns.length > 0) {
        categoryBtns.forEach(btn => {
            btn.removeEventListener('click', categoryBtnHandler);
            btn.addEventListener('click', categoryBtnHandler);
        });
    }
    
    // Add-to-cart button event listeners
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.removeEventListener('click', addToCartHandler);
        button.addEventListener('click', addToCartHandler);
    });
}

// Separate handler for category buttons for cleaner removal
function categoryBtnHandler() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    filterProducts();
}

// Handler for add-to-cart buttons
function addToCartHandler() {
    const id = this.dataset.id;
    const name = this.dataset.name;
    const price = parseFloat(this.dataset.price);
    
    // Check if item already in cart
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id,
            name,
            price,
            quantity: 1
        });
    }
    
    updateCart();
    showCartNotification();
    
    // Optional: Provide user feedback on the button itself
    this.innerHTML = '<i class="fas fa-check mr-1"></i> Ajouté!';
    this.classList.add('bg-green-600');
    setTimeout(() => {
        this.innerHTML = '<i class="fas fa-cart-plus mr-1"></i> Ajouter';
        this.classList.remove('bg-green-600');
    }, 1500);
}

// Update cart UI
function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElements.forEach(el => el.textContent = totalItems);
    
    // Update cart items list
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="text-center py-10 text-gray-500">
                <i class="fas fa-shopping-cart text-4xl mb-3"></i>
                <p>Votre panier est vide</p>
            </div>
        `;
        cartSummary.classList.add('hidden');
    } else {
        cartItemsContainer.innerHTML = '';
        
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'flex justify-between items-center py-4 border-b border-gray-200';
            itemElement.innerHTML = `
                <div>
                    <h4 class="font-medium">${item.name}</h4>
                    <p class="text-gray-600 text-sm">${item.price.toFixed(2)}€</p>
                </div>
                <div class="flex items-center">
                    <button class="decrease-quantity text-gray-500 hover:text-blue-600 px-2" data-id="${item.id}">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="mx-2">${item.quantity}</span>
                    <button class="increase-quantity text-gray-500 hover:text-blue-600 px-2" data-id="${item.id}">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="remove-item text-red-500 hover:text-red-700 ml-4" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
        
        // Calculate totals
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartSubtotal.textContent = subtotal.toFixed(2) + '€';
        cartTotal.textContent = subtotal.toFixed(2) + '€';
        
        cartSummary.classList.remove('hidden');
    }
    
    // Add event listeners to quantity buttons
    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.dataset.id;
            const item = cart.find(item => item.id === id);
            if (item) {
                item.quantity += 1;
                updateCart();
            }
        });
    });
    
    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.dataset.id;
            const itemIndex = cart.findIndex(item => item.id === id);
            
            if (itemIndex !== -1) {
                if (cart[itemIndex].quantity > 1) {
                    cart[itemIndex].quantity -= 1;
                } else {
                    cart.splice(itemIndex, 1);
                }
                updateCart();
            }
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.dataset.id;
            cart = cart.filter(item => item.id !== id);
            updateCart();
        });
    });
}

// Show cart notification
function showCartNotification() {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center z-50';
    notification.innerHTML = `
        <i class="fas fa-check-circle mr-2"></i>
        Produit ajouté au panier
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Cart modal toggle
function setupCartModal() {
    const cartButton = document.getElementById('cart-button');
    const closeCart = document.getElementById('close-cart');
    const modal = document.getElementById('cart-modal');

    if (cartButton && modal) {
        cartButton.addEventListener('click', function() {
            modal.classList.remove('hidden');
            setTimeout(() => modal.classList.add('show'), 10);
        });
    }

    if (closeCart && modal) {
        closeCart.addEventListener('click', function() {
            modal.classList.remove('show');
            setTimeout(() => modal.classList.add('hidden'), 400);
        });
    }

    // Checkout button handler
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                alert('Votre panier est vide!');
                return;
            }
            
            // Save order to localStorage
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            const newOrder = {
                id: Date.now(), // Better unique ID
                date: new Date().toISOString(),
                items: [...cart], // Copy cart
                total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            };
            orders.push(newOrder);
            localStorage.setItem('orders', JSON.stringify(orders));
            
            // Clear cart after successful checkout
            cart = [];
            updateCart();
            
            // Close modal
            const modal = document.getElementById('cart-modal');
            modal.classList.remove('show');
            setTimeout(() => modal.classList.add('hidden'), 400);

            // Prompt for admin password and redirect
            setTimeout(() => {
                const pwd = prompt('Commande passée avec succès!\nPour accéder à l\'espace admin, veuillez entrer le mot de passe administrateur :');
                if (pwd && pwd === 'admin123') {
                    window.location.href = '../admin/admin.html';
                } else if (pwd !== null) {
                    alert('Mot de passe incorrect.');
                }
            }, 500);
        });
    }
}

// Initial render when the page loads
document.addEventListener('DOMContentLoaded', function() {
    renderProducts();
    updateCart(); // Initialize cart UI
    setupCartModal(); // Setup cart modal listeners

    // Ensure an initial active category button exists
    const defaultCategoryBtn = document.querySelector('.category-btn[data-category="all"]');
    if (defaultCategoryBtn && !document.querySelector('.category-btn.active')) {
        defaultCategoryBtn.classList.add('active');
    }
    cart = [];
    updateCart();
    
    // Skip login for direct order
    sessionStorage.setItem('directOrder', 'true');
    
});
    //niggaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    // Clear cart
    


// Contact form submission
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    
    if (!name || !email || !subject || !message) {
        alert('Veuillez remplir tous les champs.');
        return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Veuillez entrer un email valide.');
        return;
    }
    
    // Here you would typically send the data to a server
    console.log('Form submitted:', { name, email, subject, message });
    
    // Show success message
    alert('Merci pour votre message! Nous vous contacterons bientôt.');
    
    // Reset form
    this.reset();
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            const mobileMenu = document.getElementById('mobile-menu');
            if (!mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        }
    });
});

// Animation on scroll
function animateOnScroll() {
    // Handle section animations
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        const sectionPosition = section.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        
        if (sectionPosition < screenPosition) {
            section.classList.add('animate');
        }
    });
}

// Listen for scroll events
window.addEventListener('scroll', animateOnScroll);
// Trigger once on page load
animateOnScroll();

// Add loading animation to product cards on page load
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        card.classList.add('loading');
        setTimeout(() => card.classList.remove('loading'), 1500);
    });
});