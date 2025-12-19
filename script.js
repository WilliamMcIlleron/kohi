//Menu Scroller and Opener
function scrollToMenu() {
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
  }
  document.querySelector('.pastry-box').addEventListener('click', () => {
    window.open('./menu.html', '_self')
}) 
  document.querySelector('.coffee-box').addEventListener('click', () => {
    window.open('./menu.html', '_self')
}) 
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

  //Gallery Opener
    document.querySelector('.see-more').addEventListener('click', () => {
        window.open('./gallery.html', '_self')
    }) 
  // loader
  // Function to show the loader
function showLoader() {
    document.querySelector('.loader').style.display = 'block';
}

// Function to hide the loader
function hideLoader() {
    document.querySelector('.loader').style.display = 'none';
}

// Example usage:
// Initially show the loader
showLoader();

  window.addEventListener('load', () => {
    hideLoader();
    
  })

  // Hamburger menu
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  hamburger.addEventListener("click", ()  => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  })

  document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  }))
