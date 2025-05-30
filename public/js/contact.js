document.getElementById('contactForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const name = this.name.value.trim();
  const email = this.email.value.trim();
  const message = this.message.value.trim();

  if (!name || !email || !message) {
    alert('Please fill out all fields.');
    return;
  }

  // Here you can later add backend API call to submit form data

  alert('Thank you for contacting us, ' + name + '! We will get back to you shortly.');

  this.reset(); // Clear form
});
