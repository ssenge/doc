// assets/js/footer.js

// Load footer.html into #footer
fetch('footer.html')
  .then(response => response.text())
  .then(html => {
    document.getElementById('footer').innerHTML = html;
    // Optionally update year dynamically
    const yearSpan = document.querySelector('#footer span');
    if (yearSpan) {
      yearSpan.innerHTML = `&copy; ${new Date().getFullYear()} TRT Clinic. All rights reserved.`;
    }
  }); 