function scrollToMenu() {
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
  }


  function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
  }

  window.addEventListener('scroll', function() {
    const header = document.getElementById('header');
    if (window.scrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });