document.getElementById('signupForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

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

    await user.sendEmailVerification();

    await user.updateProfile({
      displayName: name
    });

    const modal = document.getElementById('verificationModal');
    const modalMessage = modal.querySelector('p');
    modalMessage.textContent = 'Signup successful! A verification email has been sent to your email address. Please check your email to verify your account.';
    modal.style.display = 'flex';

  } catch (error) {
    console.error(error);
    alert(error.message || 'Signup failed.');
  }
});

document.getElementById('closeModalBtn').addEventListener('click', () => {
  const modal = document.getElementById('verificationModal');
  modal.style.display = 'none';
  window.location.href = 'login.html';
});

window.addEventListener('click', (e) => {
  const modal = document.getElementById('verificationModal');
  if (e.target === modal) {
    modal.style.display = 'none';
    window.location.href = 'login.html';
  }
});
