// Update your existing header toggle script with this:

const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const nav = document.querySelector("nav.nav");

// Mobile menu toggle
navToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  navLinks.classList.toggle('open');
  
  // Change hamburger icon
  const icon = navToggle.querySelector('i');
  if (navLinks.classList.contains('open')) {
    icon.className = 'fa-solid fa-times';
  } else {
    icon.className = 'fa-solid fa-bars';
  }
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  if (!nav.contains(e.target)) {
    navLinks.classList.remove('open');
    const icon = navToggle.querySelector('i');
    icon.className = 'fa-solid fa-bars';
  }
});

// Close mobile menu when clicking on nav links
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    const icon = navToggle.querySelector('i');
    icon.className = 'fa-solid fa-bars';
  });
});

// Initialize authentication when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Wait a bit for other scripts to load
        setTimeout(() => {
            if (window.userAuth) {
                window.userAuth.updateUserInterface();
            }
        }, 100);
    });

// Improved hero spacing function
function adjustHeroSpacing() {
  const header = document.querySelector('.header');
  const hero = document.querySelector('.hero');
  
  if (header && hero) {
    const headerHeight = header.offsetHeight;
    
    if (window.innerWidth <= 575) {
      // On mobile, just add padding-top instead of margin-top
      hero.style.paddingTop = `${headerHeight + 20}px`;
      hero.style.marginTop = '0';
    } else {
      // Desktop behavior
      hero.style.marginTop = `${headerHeight}px`;
      hero.style.paddingTop = '0';
      hero.style.minHeight = `calc(100vh - ${headerHeight}px)`;
    }
  }
}

// Run on load and when window resizes
window.addEventListener('load', adjustHeroSpacing);
window.addEventListener('resize', adjustHeroSpacing);

// Update your product carousel for better mobile experience
document.addEventListener("DOMContentLoaded", () => {
  const API = "https://dummyjson.com/products?limit=100";
  const productsGrid = document.querySelector(".products-grid");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  let currentIndex = 0;
  let cardsPerPage = 5;
  let cardWidth = 220;
  let totalProducts = 0;

  // Adjust cards per page based on screen size
  function updateCarouselSettings() {
    if (window.innerWidth <= 575) {
      cardsPerPage = 2;
      cardWidth = 180;
    } else if (window.innerWidth <= 768) {
      cardsPerPage = 3;
      cardWidth = 200;
    } else {
      cardsPerPage = 5;
      cardWidth = 220;
    }
  }

  async function fetchProducts() {
    updateCarouselSettings();
    productsGrid.innerHTML = `<div style="text-align: center; padding: 20px;">Loading products...</div>`;
    
    try {
      const res = await fetch(API);
      const data = await res.json();

      const menProducts = (data.products || []).filter(p =>
        p.category?.includes("mens-")
      ).map(p => ({
        id: p.id,
        title: p.title,
        price: p.price,
        discount: p.discountPercentage || 0,
        thumbnail: p.thumbnail || (p.images && p.images[0]) || "",
      }));

      totalProducts = menProducts.length;
      renderProducts(menProducts);
    } catch (err) {
      productsGrid.innerHTML = `<div style="text-align: center; padding: 20px; color: red;">Failed to load products.</div>`;
      console.error(err);
    }
  }

  function renderProducts(list) {
    productsGrid.innerHTML = list.map(p => {
      const oldPrice = p.discount
        ? (p.price / (1 - p.discount / 100)).toFixed(2)
        : "";
      const badge = p.discount ? `-${Math.round(p.discount)}%` : "";
      return `
        <article class="product-card">
          ${badge ? `<div class="badge" style="position: absolute; top: 10px; right: 10px; background: red; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${badge}</div>` : ""}
          <img src="${p.thumbnail}" alt="${escapeHtml(p.title)}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px;">
          <div class="product-title" style="font-size: 14px; font-weight: 500; margin: 10px 0 5px 0; line-height: 1.2;">${escapeHtml(p.title.length > 30 ? p.title.substring(0, 30) + '...' : p.title)}</div>
          <div class="product-price" style="font-weight: bold;">
            ${oldPrice ? `<span class="product-old" style="text-decoration: line-through; color: #999; font-size: 12px;">$${oldPrice}</span> ` : ""}
            <span style="color: var(--dark-color);">$${p.price}</span>
          </div>
        </article>`;
    }).join("");
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])
    );
  }

  // Navigation with mobile optimization
  nextBtn.addEventListener("click", () => {
    const maxIndex = totalProducts - cardsPerPage;
    if (currentIndex < maxIndex) {
      currentIndex += cardsPerPage;
    } else {
      currentIndex = 0;
    }
    productsGrid.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
  });

  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex -= cardsPerPage;
    } else {
      currentIndex = Math.max(totalProducts - cardsPerPage, 0);
    }
    productsGrid.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
  });

  // Update on window resize
  window.addEventListener('resize', () => {
    updateCarouselSettings();
    currentIndex = 0; // Reset position
    productsGrid.style.transform = 'translateX(0)';
  });

  fetchProducts();
});