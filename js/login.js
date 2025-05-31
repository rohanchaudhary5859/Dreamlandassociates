  const loginForm = document.getElementById('loginForm');
  const loginBtn = loginForm.querySelector('button[type="submit"]');

  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';

    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      await user.reload(); // Important to get the latest verification state

      if (user.emailVerified) {
        alert('Login successful!');
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('uid', user.uid);
        window.location.href = 'profile.html';
      } else {
        alert('Please verify your email before logging in.');
        await firebase.auth().signOut();
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message);
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Login';
    }
  });
