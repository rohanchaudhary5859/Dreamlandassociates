const propertyTable = document.getElementById('propertyTable');

function logout() {
  localStorage.removeItem('token');  // clear stored token
  alert("Admin logged out!");
  window.location.href = "admin-login.html";  // redirect to admin login page
}

async function fetchProperties() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert("Please log in first!");
    window.location.href = "admin-login.html";
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/api/admin/properties', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to fetch properties");
      return;
    }

    // Clear existing rows
    propertyTable.innerHTML = '';

    data.forEach((property, index) => {
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${property.ownerEmail || 'N/A'}</td>
        <td>${property.title}</td>
        <td>₹${property.price}</td>
        <td><span class="status ${property.status.toLowerCase()}">${property.status}</span></td>
        <td>
          ${property.status === 'Pending' ? `<button class="btn-success" onclick="approveProperty('${property._id}')">Approve</button>` : ''}
          <button class="btn-danger" onclick="deleteProperty('${property._id}')">Delete</button>
        </td>
      `;

      propertyTable.appendChild(row);
    });

  } catch (error) {
    console.error(error);
    alert('An error occurred while fetching properties.');
  }
}

async function approveProperty(id) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert("Please log in first!");
    window.location.href = "admin-login.html";
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000/api/admin/properties/${id}/approve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();

    if (res.ok) {
      alert('Property approved!');
      fetchProperties();
    } else {
      alert(data.message || 'Failed to approve property');
    }
  } catch (error) {
    console.error(error);
    alert('An error occurred while approving property.');
  }
}

async function deleteProperty(id) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert("Please log in first!");
    window.location.href = "admin-login.html";
    return;
  }

  if (!confirm("Are you sure you want to delete this property?")) return;

  try {
    const res = await fetch(`http://localhost:5000/api/admin/properties/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();

    if (res.ok) {
      alert('Property deleted!');
      fetchProperties();
    } else {
      alert(data.message || 'Failed to delete property');
    }
  } catch (error) {
    console.error(error);
    alert('An error occurred while deleting property.');
  }
}

// Load properties on page load
window.addEventListener('DOMContentLoaded', fetchProperties);
