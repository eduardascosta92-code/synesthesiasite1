const WHATSAPP_NUMBER = "5511964412118"; // Troque pelo WhatsApp da Synesthesia com DDI + DDD, sem espaços.
const CART_KEY = "synesthesia_cart";

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function formatMoney(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function updateCartCount() {
  const count = getCart().reduce((total, item) => total + item.quantity, 0);

  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = count;
  });
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
  alert(`${product.name} foi adicionado ao carrinho.`);
}

function removeFromCart(productId) {
  const cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
  renderCartPage();
}

function changeQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find(item => item.id === productId);

  if (!item) return;

  item.quantity = Math.max(1, Number(quantity));
  saveCart(cart);
  renderCartPage();
}

function getSubtotal(cart) {
  return cart.reduce((total, item) => {
    return total + Number(item.price) * item.quantity;
  }, 0);
}

function setupProductButtons() {
  document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", () => {
      addToCart({
        id: button.dataset.id,
        name: button.dataset.name,
        price: Number(button.dataset.price),
        image: button.dataset.image,
        description: button.dataset.description,
        detail: button.dataset.detail
      });
    });
  });
}

function renderCartPage() {
  const cartItems = document.getElementById("cart-items");
  const subtotalEl = document.getElementById("cart-subtotal");

  if (!cartItems || !subtotalEl) return;

  const cart = getCart();

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <h2>Seu carrinho está vazio.</h2>
        <p>Escolha seus aromas favoritos para montar o pedido.</p>
        <a href="produtos.html" class="btn-primary">Ver produtos</a>
      </div>
    `;

    subtotalEl.textContent = formatMoney(0);
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <article class="cart-item">
      <img src="${item.image}" alt="${item.name}">

      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <p>${item.description || ""}</p>
        <small>${item.detail || ""}</small>
      </div>

      <div class="cart-item-actions">
        <strong>${formatMoney(item.price)}</strong>

        <label>
          Qtd.
          <input type="number" min="1" value="${item.quantity}" data-quantity-id="${item.id}">
        </label>

        <button type="button" class="remove-item" data-remove-id="${item.id}">
          Remover
        </button>
      </div>
    </article>
  `).join("");

  subtotalEl.textContent = formatMoney(getSubtotal(cart));

  document.querySelectorAll("[data-quantity-id]").forEach(input => {
    input.addEventListener("change", () => {
      changeQuantity(input.dataset.quantityId, input.value);
    });
  });

  document.querySelectorAll("[data-remove-id]").forEach(button => {
    button.addEventListener("click", () => {
      removeFromCart(button.dataset.removeId);
    });
  });
}

function setupCheckoutForm() {
  const form = document.getElementById("checkout-form");

  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();

    const cart = getCart();

    if (cart.length === 0) {
      alert("Seu carrinho está vazio.");
      return;
    }

    const nome = document.getElementById("cliente-nome").value.trim();
    const telefone = document.getElementById("cliente-telefone").value.trim();
    const cep = document.getElementById("cliente-cep").value.trim();
    const cidade = document.getElementById("cliente-cidade").value.trim();
    const endereco = document.getElementById("cliente-endereco").value.trim();
    const observacao = document.getElementById("cliente-observacao").value.trim();

    const itens = cart.map(item => {
      return `• ${item.quantity}x ${item.name} - ${formatMoney(item.price)} cada`;
    }).join("\n");

    const subtotal = formatMoney(getSubtotal(cart));

    const message =
      `Olá! Quero finalizar um pedido na Synesthesia.\n\n` +
      `Nome: ${nome}\n` +
      `Telefone: ${telefone}\n` +
      `CEP: ${cep || "não informado"}\n` +
      `Cidade/Estado: ${cidade || "não informado"}\n` +
      `Endereço: ${endereco || "não informado"}\n\n` +
      `Itens:\n${itens}\n\n` +
      `Subtotal: ${subtotal}\n` +
      `Observações: ${observacao || "nenhuma"}\n\n` +
      `Pode confirmar disponibilidade, frete e pagamento?`;

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  setupProductButtons();
  renderCartPage();
  setupCheckoutForm();
});
