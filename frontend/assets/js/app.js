// ---------- PRODUCTS ----------
const products = [
    { id: 1, name: "Gummy Bears", price: 3.99, img: "candies/gummybears.jpg" },
    { id: 2, name: "Chocolate Bar", price: 2.49, img: "candies/chocolate.jpeg" },
    { id: 3, name: "Sour Worms", price: 4.25, img: "candies/sourworm.webp" },
    { id: 4, name: "Lollipops", price: 1.99, img: "candies/lollipop.jpeg" },
    { id: 5, name: "Jelly Beans", price: 3.49, image: "candies/jellybeans.jpg"},
    { id: 6, name: "Caramel Chews", price: 4.29, image: "candies/caramelchew.jpg"},
    { id: 7, name: "Rainbow Belts", price: 5.49, image: "candies/rainbowbelts.jpg" },
    { id: 8, name: "Peanut Butter Cups", price: 4.99, image: "candies/pbcups.jpg"},
    { id: 9, name: "Rock Candy", price: 2.99, image: "candies/rockcandy.jpg"},
    { id: 10, name: "Marshmallow Twists", price: 3.79, image: "candies/marshmallowtwists.jpg"},
    { id: 11, name: "Chocolate Pretzels", price: 5.29, image: "candies/chocpretzels.jpg"},
    { id: 12, name: "Strawberry Hard Candy", price: 2.49, image: "/assets/images/candies/strawberryhard.jpg"},
    { id: 13, name: "Mint Swirls", price: 1.99, image: "candies/mint.jpg"},
    { id: 14, name: "Cotton Candy Pop", price: 3.29, image: "candies/cottoncandypop.jpg"},
    { id: 15, name: "Sour Patch Bites", price: 3.59, image: "candies/sourpatch.jpg"},
    { id: 16, name: "Bubble Gum Balls", price: 2.99, image: "candies/bubblegumballs.jpg"},
    { id: 17, name: "Chocolate Fudge Cubes", price: 4.89, image: "candies/fudgecubes.jpg"},
    { id: 18, name: "Gummy Sharks", price: 3.99, image: "candies/gummysharks.jpg"},
    { id: 19, name: "Lemon Drops", price: 2.79, image: "candies/lemondrops.jpg"},
    { id: 20, name: "Caramel Popcorn", price: 4.59, image: "candies/caramelpopcorn.jpg"}

];

// ---------- LOAD SHOP ----------
function loadShop() {
    const grid = document.getElementById("productGrid");
    if (!grid) return;

    products.forEach(p => {
        grid.innerHTML += `
          <div class="col-md-3 mb-4">
              <div class="card shadow-sm">
                  <img src="${p.img}" class="card-img-top" style="height:180px;object-fit:cover;">
                  <div class="card-body text-center">
                      <h5>${p.name}</h5>
                      <p>$${p.price.toFixed(2)}</p>
                      <button class="btn btn-pink" onclick="addToCart(${p.id})">Add to Cart</button>
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

function addToCart(id) {
    let item = cart.find(i => i.id === id);

    if (item) {
        item.qty++;
    } else {
        const product = products.find(p => p.id === id);
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

    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.push({
        id: Date.now(),
        date: new Date().toLocaleString(),
        items: cart
    });

    localStorage.setItem("orders", JSON.stringify(orders));

    cart = [];
    saveCart();
    loadCart();
    alert("Order placed!");
}

// ---------- LOAD ORDERS ----------
function loadOrders() {
    const container = document.getElementById("ordersList");
    if (!container) return;

    const orders = JSON.parse(localStorage.getItem("orders")) || [];

    if (orders.length === 0) {
        container.innerHTML = "<p>No orders yet!</p>";
        return;
    }

    orders.forEach(order => {
        let list = order.items.map(i => `${i.qty}× ${i.name}`).join("<br>");

        container.innerHTML += `
            <div class="border p-3 mb-3 bg-white rounded">
                <h5>Order #${order.id}</h5>
                <p><strong>Date:</strong> ${order.date}</p>
                <p>${list}</p>
            </div>
        `;
    });
}

// ---------- AUTO LOAD DEPENDING ON PAGE ----------
loadShop();
loadCart();
loadOrders();
