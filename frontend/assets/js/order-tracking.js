// Order tracking and status display
const API_BASE = "http://localhost:3000/api";

// Format date to readable string
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Get status badge class
function getStatusBadgeClass(status) {
  const statusMap = {
    "Created": "status-created",
    "Shipped": "status-shipped",
    "Delivered": "status-delivered"
  };
  return statusMap[status] || "status-created";
}

// Render order status with timeline
function renderOrderStatus(order) {
  const statusBadge = `<span class="status-badge ${getStatusBadgeClass(order.status)}">${order.status}</span>`;
  
  // Build status timeline
  let timeline = `<div class="status-timeline">`;
  const statuses = ["Created", "Shipped", "Delivered"];
  
  statuses.forEach(s => {
    const historyItem = order.statusHistory?.find(h => h.status === s);
    if (historyItem) {
      const isActive = order.status === s;
      timeline += `
        <div class="timeline-item ${isActive ? 'active' : ''}">
          ✓ ${s}: ${formatDate(historyItem.timestamp)}
        </div>
      `;
    } else {
      timeline += `<div class="timeline-item">○ ${s}: Pending</div>`;
    }
  });
  timeline += `</div>`;

  // Format items
  let itemsHtml = `<small class="text-muted">`;
  order.items.forEach(item => {
    itemsHtml += `${item.name} (x${item.qty}) - $${item.price.toFixed(2)}<br>`;
  });
  itemsHtml += `</small>`;

  return `
    <div class="card order-card">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h5 class="card-title mb-1">Order #${order._id.slice(-8).toUpperCase()}</h5>
            <p class="text-muted mb-0"><small>Placed: ${formatDate(order.createdAt)}</small></p>
          </div>
          ${statusBadge}
        </div>
        
        <p class="mb-2"><strong>Total:</strong> $${order.total.toFixed(2)}</p>
        ${itemsHtml}
        
        ${timeline}
      </div>
    </div>
  `;
}

// Load and display orders
async function loadOrderStatus() {
  const container = document.getElementById("ordersList");
  if (!container) return;

  const token = localStorage.getItem("token");
  if (!token) {
    container.innerHTML = `<div class="alert alert-info">Please <a href="index.html">log in</a> to view your orders.</div>`;
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) {
      container.innerHTML = `<div class="alert alert-danger">Failed to load orders</div>`;
      return;
    }

    const data = await res.json();
    const orders = data.orders || [];

    if (orders.length === 0) {
      container.innerHTML = `<div class="alert alert-info">No orders yet. <a href="shop.html">Start shopping!</a></div>`;
      return;
    }

    container.innerHTML = orders.map(order => renderOrderStatus(order)).join("");
  } catch (err) {
    console.error("Error loading orders:", err);
    container.innerHTML = `<div class="alert alert-danger">Error loading orders. Please try again.</div>`;
  }
}

// Load orders on page load
document.addEventListener("DOMContentLoaded", loadOrderStatus);

// Expose for manual refresh
window.loadOrderStatus = loadOrderStatus;
