// ---------- PRODUCTS ----------
// Fetch products from API instead of static array
let products = [];

const API_BASE = "http://localhost:3000/api";

async function fetchProductsFromAPI() {
  try {
    const res = await fetch(`${API_BASE}/products`);
    const data = await res.json();
    products = data.products || [];
    return products;
  } catch (err) {
    console.error("Failed to fetch products from API:", err);
    alert("Failed to load products. Please refresh the page.");
    return [];
  }
}

// ---------- LOAD SHOP ----------
async function loadShop() {
    const grid = document.getElementById("productGrid");
    if (!grid) return;

    // Fetch latest products from API
    await fetchProductsFromAPI();

    grid.innerHTML = ""; // Clear before rendering
    products.forEach(p => {
        // Use 'image' field from API, fallback to 'img'
        const imgPath = p.image || p.img || "candies/default.jpg";
        grid.innerHTML += `
          <div class="col-md-3 mb-4">
              <div class="card shadow-sm">
                  <img src="${imgPath}" class="card-img-top" style="height:180px;object-fit:cover;">
                  <div class="card-body text-center">
                      <h5>${p.name}</h5>
                      <p>$${p.price.toFixed(2)}</p>
                      <p style="font-size:0.85rem;color:#666;">Stock: ${p.stock}</p>
                      <button class="btn btn-pink" onclick="addToCart(${p.productId})">Add to Cart</button>
                  </div>
              </div>
          </div>
        `;
    });
}

// ---------- CART SYSTEM ----------
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(productId) {
    let item = cart.find(i => i.productId === productId);

    if (item) {
        item.qty++;
    } else {
        const product = products.find(p => p.productId === productId);
        if (!product) {
            alert("Product not found");
            return;
        }
        cart.push({ ...product, qty: 1 });
    }

    saveCart();
    alert("Added to cart!");
    loadCart();
}

function loadCart() {
    const table = document.getElementById("cartTable");
    const totalEl = document.getElementById("cartTotal");

    if (!table) return;

    table.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        let subtotal = item.price * item.qty;
        total += subtotal;

        table.innerHTML += `
          <tr>
              <td>${item.name}</td>
              <td>$${item.price.toFixed(2)}</td>
              <td>
                  <input type="number" min="1" class="form-control qty-input"
                         value="${item.qty}" onchange="updateQty(${index}, this.value)">
              </td>
              <td>$${subtotal.toFixed(2)}</td>
              <td><button class="btn btn-danger" onclick="removeItem(${index})">X</button></td>
          </tr>
        `;
    });

    totalEl.innerText = total.toFixed(2);
}

function updateQty(index, newQty) {
    cart[index].qty = Number(newQty);
    saveCart();
    loadCart();
}

function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    loadCart();
}

function checkout() {
    if (cart.length === 0) {
        alert("Cart is empty");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please log in to place an order.");
        return;
    }

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

    (async () => {
        try {
            const res = await fetch("http://localhost:3000/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ items: cart, total })
            });

            const data = await res.json();
            if (!res.ok) return alert(data.msg || "Could not place order");

            cart = [];
            saveCart();
            loadCart();

            // Reload products to reflect updated stock levels
            await fetchProductsFromAPI();

            alert("Order placed!");
            window.location.href = "orders.html";
        } catch (err) {
            console.error("Checkout error:", err);
            alert("Error connecting to server");
        }
    })();
}

// ---------- LOAD ORDERS ----------
function loadOrders() {
    const container = document.getElementById("ordersList");
    if (!container) return;
    const token = localStorage.getItem("token");
    if (!token) {
        container.innerHTML = "<p>Please log in to see your orders.</p>";
        return;
    }

    (async () => {
        try {
            const res = await fetch("http://localhost:3000/api/orders", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await res.json();
            if (!res.ok) {
                container.innerHTML = `<p>${data.msg || "Could not fetch orders."}</p>`;
                return;
            }

            const orders = data.orders || [];
            if (orders.length === 0) {
                container.innerHTML = "<p>No orders yet!</p>";
                return;
            }

            container.innerHTML = "";
            orders.forEach(order => {
                let list = order.items.map(i => `${i.qty}× ${i.name}`).join("<br>");

                container.innerHTML += `
                    <div class="border p-3 mb-3 bg-white rounded">
                        <h5>Order #${order._id}</h5>
                        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                        <p>${list}</p>
                        <p><strong>Status:</strong> ${order.status}</p>
                    </div>
                `;
            });
        } catch (err) {
            container.innerHTML = "<p>Error connecting to server</p>";
        }
    })();
}

// ---------- AUTO LOAD DEPENDING ON PAGE ----------
loadShop();
loadCart();
loadOrders();
