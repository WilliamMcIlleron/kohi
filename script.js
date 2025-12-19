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
