document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    if (user.emailVerified) {
      alert('Login successful!');

      // Store user info in localStorage if needed
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('uid', user.uid);

      // Optional: use a custom claim or firestore field to handle roles
      // You might fetch role info from Firestore if needed

      // Redirect (you can customize this logic)
      window.location.href = 'profile.html'; // or 'admin.html' if you detect admin role
    } else {
      alert('Please verify your email before logging in.');
      await firebase.auth().signOut();
    }

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
});
