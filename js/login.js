document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      alert('Login successful!');

      if (data.user.role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'profile.html';
      }
    } else {
      alert(data.message || 'Login failed');
    }

  } catch (err) {
    console.error(err);
    alert('An error occurred while logging in.');
  }
});
