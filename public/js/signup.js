document.getElementById('signupForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Basic validation
  if (!name || !email || !phone || !password || !confirmPassword) {
    alert('Please fill out all fields.');
    return;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match.');
    return;
  }

  try {
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Send email verification
    await user.sendEmailVerification();

    // Update display name
    await user.updateProfile({
      displayName: name
    });

    alert('Signup successful! A verification email has been sent to your email address.');

    // Optional: Redirect to login page
    window.location.href = 'login.html';

  } catch (error) {
    console.error(error);
    alert(error.message || 'Signup failed.');
  }
});
