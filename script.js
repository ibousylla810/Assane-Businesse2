// État Global
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const PHONE_NUMBER_SELLER = "+221779570158"; // À CHANGER : Votre numéro WhatsApp

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(products);
    updateCartIcon();
    
    // EmailJS Init (À configurer dans le README)
    // emailjs.init("VOTRE_PUBLIC_KEY"); 
});

// 1. Affichage des produits
function renderProducts(list) {
    const container = document.getElementById('catalog');
    container.innerHTML = list.map(product => `
        <div class="product-card">
            ${product.badge ? `<span class="badge">${product.badge}</span>` : ''}
            <img src="${product.image}" alt="${product.name}" class="prod-img">
            <div class="prod-info">
                <div class="prod-cat">${product.category}</div>
                <div class="prod-name">${product.name}</div>
                <div class="prod-price">${formatPrice(product.price)}</div>
                <select id="size-${product.id}" class="size-select">
                    ${product.sizes.map(s => `<option value="${s}">${s}</option>`).join('')}
                </select>
                <button onclick="addToCart(${product.id})" class="btn-add">
                    Ajouter au panier
                </button>
            </div>
        </div>
    `).join('');
}

// 2. Filtrage
function filterProducts(category) {
    // Gestion classe active
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (category === 'all') {
        renderProducts(products);
    } else {
        const filtered = products.filter(p => p.category === category);
        renderProducts(filtered);
    }
}

// 3. Gestion du Panier
function addToCart(id) {
    const product = products.find(p => p.id === id);
    const size = document.getElementById(`size-${id}`).value;
    
    const existingItem = cart.find(item => item.id === id && item.size === size);

    if (existingItem) {
        existingItem.qty++;
    } else {
        cart.push({ ...product, size, qty: 1 });
    }

    saveCart();
    updateCartIcon();
    
    // Feedback visuel
    const btn = event.target;
    const originalText = btn.innerText;
    btn.innerText = "Ajouté ✔";
    btn.style.background = "#10b981";
    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.background = "var(--primary)";
    }, 1500);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCartItems();
}

function changeQty(index, change) {
    if (cart[index].qty + change > 0) {
        cart[index].qty += change;
        saveCart();
        renderCartItems();
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartIcon() {
    const count = cart.reduce((acc, item) => acc + item.qty, 0);
    document.getElementById('cart-count').innerText = count;
}

// 4. Affichage Modal Panier
function toggleCart() {
    const modal = document.getElementById('cart-modal');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        renderCartItems();
        modal.style.display = 'block';
    }
}

function renderCartItems() {
    const container = document.getElementById('cart-items');
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding:20px;'>Votre panier est vide.</p>";
    } else {
        container.innerHTML = cart.map((item, index) => {
            total += item.price * item.qty;
            return `
            <div class="cart-item">
                <img src="${item.image}" class="cart-img">
                <div class="cart-details">
                    <h4>${item.name} (${item.size})</h4>
                    <div>${formatPrice(item.price)}</div>
                    <div class="cart-controls">
                        <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                        <i class="fas fa-trash remove-btn" onclick="removeFromCart(${index})"></i>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }
    document.getElementById('cart-total').innerText = formatPrice(total);
}

// 5. Checkout Logic
function openCheckout() {
    if (cart.length === 0) return alert("Panier vide !");
    toggleCart(); // Ferme panier
    document.getElementById('checkout-modal').style.display = 'block';
}

function closeCheckout() {
    document.getElementById('checkout-modal').style.display = 'none';
}

function selectPayment(method) {
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    document.getElementById('payment-method').value = method;
    
    const infoBox = document.getElementById('payment-info');
    infoBox.classList.remove('hidden');
    
    // Mettre à jour le numéro selon le choix (Exemple)
    const numeroVendeur = method === 'wave' $"779570158 : "779570158";
    infoBox.querySelector('strong').innerText = numeroVendeur;
}

// 6. Validation de Commande (Le Cœur du système)
function processOrder(e) {
    e.preventDefault();

    const formData = {
        nom: document.getElementById('nom').value,
        tel: document.getElementById('tel').value,
        region: document.getElementById('region').value,
        adresse: document.getElementById('adresse').value,
        method: document.getElementById('payment-method').value,
        payNumber: document.getElementById('payment-number').value,
        items: cart,
        total: cart.reduce((acc, item) => acc + (item.price * item.qty), 0)
    };

    if (!formData.method) return alert("Veuillez choisir un mode de paiement");

    // A. Option Notification EmailJS (Backend simulé)
    /*
    emailjs.send("SERVICE_ID", "TEMPLATE_ID", {
        to_name: "Assane",
        from_name: formData.nom,
        message: formatOrderText(formData),
        ...
    });
    */

    // B. Option WhatsApp (Redirection directe - Plus fiable sans serveur)
    const text = encodeURIComponent(formatOrderForWhatsApp(formData));
    const waLink = `https://wa.me/${PHONE_NUMBER_SELLER}?text=${text}`;

    // Simulation de succès
    alert("Commande pré-validée ! Vous allez être redirigé vers WhatsApp pour envoyer le récapitulatif.");
    
    // Vide le panier et redirige
    cart = [];
    saveCart();
    updateCartIcon();
    closeCheckout();
    window.open(waLink, '_blank');
}

// Utilitaires
function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
}

function formatOrderForWhatsApp(data) {
    let itemsList = data.items.map(i => `- ${i.qty}x ${i.name} (${i.size}) : ${i.price * i.qty} F`).join('\n');
    return `*NOUVELLE COMMANDE ASSANE BUSINESS*\n\n` +
           `👤 *Client:* ${data.nom}\n` +
           `📞 *Tél:* ${data.tel}\n` +
           `📍 *Lieu:* ${data.region}, ${data.adresse}\n\n` +
           `🛒 *Articles:*\n${itemsList}\n\n` +
           `💰 *TOTAL:* ${formatPrice(data.total)}\n` +
           `💳 *Paiement:* ${data.method.toUpperCase()} (Num: ${data.payNumber})`;
}

// Close modals on click outside
window.onclick = function(event) {
    if (event.target.className === 'modal') {
        event.target.style.display = "none";
    }
}
