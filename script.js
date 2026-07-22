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

  // Lazy-load gallery videos: only fetch source once the video scrolls into view
  const lazyVideos = document.querySelectorAll('.lazy-video');
  if (lazyVideos.length) {
    const videoObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const video = entry.target;
          const source = video.querySelector('source[data-src]');
          if (source) {
            source.src = source.dataset.src;
            source.removeAttribute('data-src');
            video.load();
          }
          observer.unobserve(video);
        }
      });
    }, { rootMargin: '200px 0px' }); // start loading a bit before it's on screen

    lazyVideos.forEach(video => videoObserver.observe(video));
  }