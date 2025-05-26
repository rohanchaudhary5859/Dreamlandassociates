document.getElementById('addPropertyForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  // Get form data
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const price = document.getElementById('price').value;
  const location = document.getElementById('location').value.trim();
  const imageUrl = document.getElementById('imageUrl').value.trim();

  // Validate inputs (basic)
  if (!title || !description || !price || !location || !imageUrl) {
    alert('Please fill out all fields.');
    return;
  }

  // Get user token from localStorage for authentication
  const token = localStorage.getItem('token');
  if (!token) {
    alert('You must be logged in to add a property.');
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/api/properties', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,  // pass token in headers
      },
      body: JSON.stringify({ title, description, price, location, imageUrl }),
    });

    const data = await res.json();

    if (res.ok) {
      alert('Property added successfully!');
      this.reset();
    } else {
      alert(data.message || 'Failed to add property');
    }
  } catch (err) {
    console.error(err);
    alert('An error occurred while adding property.');
  }
});
