// Minimal admin UI JS for inventory management
const API_BASE = "http://localhost:3000/api";

async function fetchProducts() {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const res = await fetch(`${API_BASE}/products`, {
      method: 'GET',
      headers: headers
    });
    
    if (!res.ok) {
      console.error("Failed to fetch products:", res.status);
      showAlert("Failed to load products (Server error)", "danger");
      return [];
    }
    
    const data = await res.json();
    console.log("Fetched products:", data);
    return data.products || [];
  } catch (err) {
    console.error("fetchProducts error", err);
    showAlert("Failed to load products: " + err.message, "danger");
    return [];
  }
}

function showAlert(msg, type = "info") {
  const el = document.getElementById("alert");
  el.innerHTML = `<div class="alert alert-${type}" role="alert">${msg}</div>`;
  setTimeout(() => (el.innerHTML = ""), 4000);
}

function renderProducts(products) {
  const tbody = document.getElementById("productsBody");
  tbody.innerHTML = "";
  products.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.productId}</td>
      <td><input class="form-control form-control-sm" data-field="name" data-id="${p.productId}" value="${escapeHtml(p.name)}"></td>
      <td><input class="form-control form-control-sm" data-field="price" data-id="${p.productId}" value="${p.price}"></td>
      <td><input class="form-control form-control-sm" data-field="stock" data-id="${p.productId}" value="${p.stock}"></td>
      <td><input class="form-control form-control-sm" data-field="image" data-id="${p.productId}" value="${escapeHtml(p.image || '')}"></td>
      <td>
        <button class="btn btn-sm btn-success save-btn" data-id="${p.productId}">Save</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // attach save handlers
  document.querySelectorAll('.save-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      await saveProduct(id);
    });
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, function (s) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'})[s]; });
}

async function saveProduct(productId) {
  try {
    const inputs = document.querySelectorAll(`input[data-id='${productId}']`);
    const payload = {};
    inputs.forEach(i => {
      const field = i.dataset.field;
      let val = i.value;
      if (field === 'price' || field === 'stock') val = Number(val);
      payload[field] = val;
    });

    const token = localStorage.getItem('token');
    if (!token) return showAlert('Please login as admin first', 'warning');

    const res = await fetch(`${API_BASE}/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      showAlert(data.msg || 'Failed to save', 'danger');
      return;
    }
    showAlert('Product saved', 'success');
    loadAndRender();
  } catch (err) {
    console.error('saveProduct error', err);
    showAlert('Save failed', 'danger');
  }
}

async function createProductFromForm(e) {
  e.preventDefault();
  const productId = Number(document.getElementById('newProductId').value);
  const name = document.getElementById('newProductName').value.trim();
  const price = Number(document.getElementById('newProductPrice').value);
  const stock = Number(document.getElementById('newProductStock').value);
  const image = document.getElementById('newProductImage').value.trim();

  const token = localStorage.getItem('token');
  if (!token) return showAlert('Please login as admin first', 'warning');

  try {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ productId, name, price, stock, image })
    });
    const data = await res.json();
    if (!res.ok) return showAlert(data.msg || 'Failed to create', 'danger');
    showAlert('Product created', 'success');
    document.getElementById('createProductForm').reset();
    loadAndRender();
  } catch (err) {
    console.error('createProduct error', err);
    showAlert('Create failed', 'danger');
  }
}

async function loadAndRender() {
  const products = await fetchProducts();
  renderProducts(products);
  renderInventoryTable(products);
}

// ==================== INVENTORY MANAGEMENT ====================

function renderInventoryTable(products) {
  const tbody = document.getElementById('inventoryBody');
  tbody.innerHTML = '';
  products.forEach(p => {
    const tr = document.createElement('tr');
    const stockClass = p.stock <= 10 ? 'text-danger fw-bold' : '';
    tr.innerHTML = `
      <td>${p.productId}</td>
      <td>${escapeHtml(p.name)}</td>
      <td class="${stockClass}">${p.stock}</td>
      <td>
        <div class="input-group input-group-sm">
          <input class="form-control adjust-qty" type="number" value="0" data-id="${p.productId}" min="-${p.stock}" max="10000">
          <span class="input-group-text">units</span>
        </div>
      </td>
      <td>
        <button class="btn btn-sm btn-success adjust-add-btn" data-id="${p.productId}">+5</button>
        <button class="btn btn-sm btn-warning adjust-remove-btn" data-id="${p.productId}">-5</button>
        <button class="btn btn-sm btn-info adjust-apply-btn" data-id="${p.productId}">Apply</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Attach event listeners
  document.querySelectorAll('.adjust-add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const input = document.querySelector(`.adjust-qty[data-id='${id}']`);
      input.value = (Number(input.value) || 0) + 5;
    });
  });

  document.querySelectorAll('.adjust-remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const input = document.querySelector(`.adjust-qty[data-id='${id}']`);
      input.value = (Number(input.value) || 0) - 5;
    });
  });

  document.querySelectorAll('.adjust-apply-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      await applyStockAdjustment(id);
    });
  });
}

async function applyStockAdjustment(productId) {
  try {
    const input = document.querySelector(`.adjust-qty[data-id='${productId}']`);
    const adjustment = Number(input.value) || 0;
    if (adjustment === 0) return showAlert('No adjustment entered', 'warning');

    const token = localStorage.getItem('token');
    if (!token) return showAlert('Please login as admin first', 'warning');

    // Get current product to calculate new stock
    const res = await fetch(`${API_BASE}/products/${productId}`);
    const data = await res.json();
    if (!res.ok) return showAlert('Failed to fetch product', 'danger');

    const currentStock = data.product.stock;
    const newStock = currentStock + adjustment;
    if (newStock < 0) return showAlert('Stock cannot go negative', 'danger');

    // Update stock via PUT
    const updateRes = await fetch(`${API_BASE}/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ stock: newStock })
    });
    const updateData = await updateRes.json();
    if (!updateRes.ok) return showAlert(updateData.msg || 'Failed to update', 'danger');

    showAlert(`Stock adjusted by ${adjustment > 0 ? '+' : ''}${adjustment}`, 'success');
    input.value = 0; // Reset input
    loadAndRender();
  } catch (err) {
    console.error('applyStockAdjustment error', err);
    showAlert('Adjustment failed', 'danger');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadAndRender();
  document.getElementById('createProductForm').addEventListener('submit', createProductFromForm);
});

// expose for testing
window.loadAndRender = loadAndRender;
window.applyStockAdjustment = applyStockAdjustment;
