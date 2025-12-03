// Admin order management
const API_BASE = "http://localhost:3000/api";

function showAlert(msg, type = "info") {
  const el = document.getElementById("alert");
  el.innerHTML = `<div class="alert alert-${type}" role="alert">${msg}</div>`;
  setTimeout(() => (el.innerHTML = ""), 4000);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getStatusBadgeClass(status) {
  const statusMap = {
    "Created": "status-created",
    "Shipped": "status-shipped",
    "Delivered": "status-delivered"
  };
  return statusMap[status] || "status-created";
}

// Fetch all orders 
async function fetchAllOrders() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return [];

    // Get current user's orders first
    const res = await fetch(`${API_BASE}/orders`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.orders || [];
  } catch (err) {
    console.error("fetchAllOrders error:", err);
    return [];
  }
}

// Update order status
async function updateOrderStatus(orderId, newStatus) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      showAlert("Please login as admin first", "warning");
      return false;
    }

    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });

    const data = await res.json();
    if (!res.ok) {
      showAlert(data.msg || "Failed to update status", "danger");
      return false;
    }

    showAlert(`Order status updated to ${newStatus}`, "success");
    loadAndRender();
    return true;
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    showAlert("Update failed", "danger");
    return false;
  }
}

// Render orders table
function renderOrders(orders) {
  const tbody = document.getElementById("ordersBody");
  tbody.innerHTML = "";

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No orders found</td></tr>`;
    return;
  }

  orders.forEach(order => {
    const nextStatus = getNextStatus(order.status);
    const statusBadge = `<span class="status-badge ${getStatusBadgeClass(order.status)}">${order.status}</span>`;
    
    let actionBtn = "";
    if (nextStatus) {
      actionBtn = `<button class="btn btn-sm btn-primary" onclick="updateOrderStatus('${order._id}', '${nextStatus}')">Mark ${nextStatus}</button>`;
    } else {
      actionBtn = `<span class="text-success">✓ Completed</span>`;
    }

    // Get customer name
    const customerName = order.user?.name || "User";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><small>${order._id.slice(-8).toUpperCase()}</small></td>
      <td>${customerName}</td>
      <td>$${order.total.toFixed(2)}</td>
      <td>${statusBadge}</td>
      <td><small>${formatDate(order.createdAt)}</small></td>
      <td>${actionBtn}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Get next status in workflow
function getNextStatus(currentStatus) {
  const workflow = { "Created": "Shipped", "Shipped": "Delivered", "Delivered": null };
  return workflow[currentStatus] || null;
}

// Load and render
async function loadAndRender() {
  const orders = await fetchAllOrders();
  renderOrders(orders);
}

document.addEventListener("DOMContentLoaded", loadAndRender);

// Expose for testing
window.loadAndRender = loadAndRender;
window.updateOrderStatus = updateOrderStatus;
