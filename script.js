const App = {
  // -------------------------------
  // Configuration
  config: { 
    basePrice: 1899,       // 👉 Base price of a single unit
    maxQuantity: 10        // 👉 Maximum allowed quantity
  },

  // -------------------------------
  // Quantities per color
  quantities: { black: 1, blue: 1, white: 1, darkblue: 1 },

  selectedProduct: 'black',  // 👉 Default selected product
  isSubmitting: false,       // 👉 Prevent multiple submissions

  // -------------------------------
  // Initialize App
  init() {
    // 🟢 Stock availability per color
    this.stock = {
      black: true,      // ✅ Available, false হলে disable হবে
      blue: true,       
      white: true,
      darkblue: true
    };

    // ❌ Disable unavailable products
    Object.keys(this.stock).forEach(color => {
      const productEl = document.getElementById(`product-${color}`);
      const radioEl   = document.getElementById(`radio-${color}`);
      const qtyBox    = document.getElementById(`qty-${color}-box`);

      if (!this.stock[color]) {
        productEl.classList.add('disabled');  // CSS style greyed out
        if (radioEl) radioEl.disabled = true; // Radio button disable
        if (qtyBox) qtyBox.style.display = 'none'; // Hide quantity box
      }
    });

    // Bind event listeners
    this.bindEvents();

    // First available product select
    const firstAvailable = Object.keys(this.stock).find(c => this.stock[c]);
    this.selectProduct(firstAvailable);

    // Setup back-to-top button
    this.setupBackToTop();

    // Start countdown timer
    this.startCountdown();
  },

  // -------------------------------
  // Bind Event Listeners
  bindEvents() {
    // -------------------------------
    // Form submission
    document.getElementById('order-form').addEventListener('submit', e => {
      e.preventDefault();
      if (this.validateForm()) {
        this.updateTotals();
        e.target.submit(); // Submit form
      }
    });

    // -------------------------------
    // Product selection click
    document.querySelector('.form-container').addEventListener('click', e => {
      const product = e.target.closest('.product');
      if (!product) return;
      let color = product.id.split('-')[1];  // product-black → black
      if (!this.stock[color]) return;        // ❌ skip if unavailable
      this.selectProduct(color);
    });

    // -------------------------------
    // Quantity buttons (+/-)
    document.querySelectorAll('.quantity button').forEach(btn => {
      btn.addEventListener('click', () => {
        let color = btn.id.split('-')[2]; // btn-minus-black → black
        const delta = btn.id.includes('minus') ? -1 : 1;
        this.changeQty(color, delta);
      });

      btn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
  },

  // -------------------------------
  // Select Product
  selectProduct(color) {
    this.selectedProduct = color;

    ['black','blue','white','darkblue'].forEach(c => {
      const productEl = document.getElementById(`product-${c}`);
      const radioEl   = document.getElementById(`radio-${c}`);
      const qtyBox    = document.getElementById(`qty-${c}-box`);

      if (!radioEl.disabled) radioEl.checked = color === c;   // Radio check
      if(qtyBox) qtyBox.style.display = color === c ? 'flex' : 'none'; // Show qty box only for selected
      productEl.classList.toggle('selected', color === c);   // Highlight selected
      productEl.setAttribute('aria-checked', color === c);
    });

    this.updateTotals();    // Update subtotal & total
  },

  // -------------------------------
  // Change Quantity
  changeQty(color, delta) {
    if (color !== this.selectedProduct || this.isSubmitting) return;
    const newQty = this.quantities[color] + delta;

    // Validation
    if (newQty < 1 || newQty > this.config.maxQuantity) {
      const message = newQty < 1 ? 'পরিমাণ ১ এর কম হতে পারে না' 
                                 : `পরিমাণ ${this.config.maxQuantity} এর বেশি হতে পারে না`;
      alert(message);
      return;
    }

    this.quantities[color] = newQty;
    document.getElementById(`qty-${color}`).value = newQty;
    this.updateTotals();
  },

  // -------------------------------
  // Update totals
  updateTotals() {
    const subtotal = this.config.basePrice * this.quantities[this.selectedProduct];
    document.getElementById('subtotal').innerText = `৳${subtotal.toLocaleString('bn-BD')}`;
    document.getElementById('total').innerText = `৳${subtotal.toLocaleString('bn-BD')}`;
    document.getElementById('hiddenSubtotal').value = subtotal;
    document.getElementById('hiddenTotal').value = subtotal;

    const productNames = {
      black: 'Samsung Guru Music 2 (Black)',
      blue: 'Samsung Guru Music 2 (Blue)',
      white: 'Samsung Guru Music 2 (White)',
      darkblue: 'Samsung Guru Music 2 (Dark Blue)'
    };
    document.getElementById('hiddenProduct').value = productNames[this.selectedProduct];
    document.getElementById('hiddenQuantity').value = this.quantities[this.selectedProduct];
  },

  // -------------------------------
  // Form Validation
  validateForm() {
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const nameRegex = /^[A-Za-z\s\u0980-\u09FF]+$/;
    const phoneRegex = /^01[3-9][0-9]{8}$/;
    let valid = true;

    // Hide all previous errors
    document.querySelectorAll('.error').forEach(e => e.style.display = 'none');

    if (!nameRegex.test(name) || name.length === 0) {
      document.getElementById('name-error').style.display = 'block';
      valid = false;
    }
    if (!phoneRegex.test(phone)) {
      document.getElementById('phone-error').style.display = 'block';
      valid = false;
    }
    if (address === '') {
      document.getElementById('address-error').style.display = 'block';
      valid = false;
    }

    return valid;
  },

  // -------------------------------
  // Back to Top button
  setupBackToTop() {
    const backToTop = document.getElementById('back-to-top');
    if (!backToTop) return;
    window.addEventListener('scroll', () => {
      backToTop.style.display = window.scrollY > 1500 ? 'block' : 'none';
    });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  },

  // -------------------------------
  // Countdown Timer (আজ রাত ১২টা পর্যন্ত)
  startCountdown() {
    const offerEnd = new Date();
    offerEnd.setHours(23, 59, 59, 999);

    function toBengaliNumber(num) {
      const bengaliDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
      return String(num).split('').map(d => bengaliDigits[d] || d).join('');
    }

    const countdownEl = document.getElementById('countdown');
    if (!countdownEl) return;

    function updateCountdown() {
      const now = new Date().getTime();
      const distance = offerEnd - now;

      if (distance <= 0) {
        countdownEl.textContent = "⏰ অফার শেষ হয়েছে";
        return;
      }

      let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((distance % (1000 * 60)) / 1000);

      countdownEl.textContent = `সময় বাকি: ${toBengaliNumber(hours)} ঘণ্টা ${toBengaliNumber(minutes)} মিনিট ${toBengaliNumber(seconds)} সেকেন্ড`;
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();
  }
};

// -------------------------------
// Window Load
window.onload = () => App.init();