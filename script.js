const App = {
  config: { 
    basePrice: 1899, 
    shipping: { insideDhaka: 0, outsideDhaka: 0 }, 
    maxQuantity: 10 
  },

  // 👉 সব কালারের জন্য quantity ট্র্যাক রাখা হচ্ছে
  quantities: { black: 1, blue: 1, white: 1 },

  shipping: 0, // default outside Dhaka
  selectedProduct: 'blue', // 👉 ডিফল্ট সিলেক্ট করা প্রোডাক্ট (এখন Blue)

  isSubmitting: false,

  init() {
    // ------------------------------
    // 🟢 কালার স্টক কন্ট্রোল (এখানেই অন true /অফ করবেন false )
    // ------------------------------
    this.stock = {
      black: true, // ❌ Black unavailable
      blue: true,   // ✅ Blue available
      white: true   // ✅ White available
    };

    // unavailable কালার disable করা
    Object.keys(this.stock).forEach(color => {
      const productEl = document.getElementById(`product-${color}`);
      const radioEl   = document.getElementById(`radio-${color}`);

      if (!this.stock[color]) {
        productEl.classList.add('disabled');
        if (radioEl) radioEl.disabled = true;
      }
    });

    this.bindEvents();

    // 👉 প্রথমে যেটা available সেটিকে সিলেক্ট করা
    const firstAvailable = Object.keys(this.stock).find(c => this.stock[c]);
    this.selectProduct(firstAvailable);

    this.setupBackToTop();
  },

  // ------------------------------
  // ইভেন্ট হ্যান্ডলার
  // ------------------------------
  bindEvents() {
    // ফর্ম সাবমিশন
    document.getElementById('order-form').addEventListener('submit', e => {
      e.preventDefault();
      if (this.validateForm()) {
        this.updateTotals();
        e.target.submit();
      }
    });

    // প্রোডাক্ট সিলেকশন
    document.querySelector('.form-container').addEventListener('click', e => {
      const product = e.target.closest('.product');
      if (product) {
        let color = '';
        if (product.id.includes('black')) color = 'black';
        else if (product.id.includes('blue')) color = 'blue';
        else if (product.id.includes('white')) color = 'white';

        // ❌ যদি কালার unavailable হয় → কিছু করবে না
        if (!this.stock[color]) return;

        this.selectProduct(color);
      }
    });

    // পরিমাণ পরিবর্তন
    document.querySelectorAll('.quantity button').forEach(btn => {
      btn.addEventListener('click', () => {
        let color = '';
        if (btn.id.includes('black')) color = 'black';
        else if (btn.id.includes('blue')) color = 'blue';
        else if (btn.id.includes('white')) color = 'white';
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

    // শিপিং পরিবর্তন
    document.querySelectorAll('input[name="shipping"]').forEach(input => {
      input.addEventListener('change', () => this.updateShipping(parseInt(input.value)));
    });

    this.updateButtonsState();
  },

  // ------------------------------
  // প্রোডাক্ট সিলেকশন
  // ------------------------------
  selectProduct(color) {
    this.selectedProduct = color;

    ['black', 'blue', 'white'].forEach(c => {
      const productEl = document.getElementById(`product-${c}`);
      const radioEl   = document.getElementById(`radio-${c}`);

      if (!radioEl.disabled) {
        radioEl.checked = color === c;
      }
      document.getElementById(`qty-${c}-box`).style.display = color === c ? 'flex' : 'none';
      productEl.classList.toggle('selected', color === c);
      productEl.setAttribute('aria-checked', color === c);
    });

    this.updateTotals();
    this.updateButtonsState();
  },

  // ------------------------------
  // পরিমাণ পরিবর্তন
  // ------------------------------
  changeQty(color, delta) {
    if (color !== this.selectedProduct || this.isSubmitting) return;
    const newQty = this.quantities[color] + delta;
    if (newQty < 1 || newQty > this.config.maxQuantity) {
      const message = newQty < 1 
        ? 'পরিমাণ ১ এর কম হতে পারে না' 
        : `পরিমাণ ${this.config.maxQuantity} এর বেশি হতে পারে না`;
      const errEl = document.getElementById('qty-error');
      errEl.style.display = 'block';
      errEl.innerText = message;
      setTimeout(() => { errEl.style.display = 'none'; }, 3000);
      return;
    }
    this.quantities[color] = newQty;
    document.getElementById(`qty-${color}`).value = newQty;
    this.updateTotals();
    this.updateButtonsState();
  },

  // ------------------------------
  // শিপিং আপডেট
  // ------------------------------
  updateShipping(amount) {
    this.shipping = amount;
    this.updateTotals();
  },

  // ------------------------------
  // টোটাল আপডেট
  // ------------------------------
  updateTotals() {
    const subtotal = this.config.basePrice * this.quantities[this.selectedProduct];
    const total = subtotal + this.shipping;
    document.getElementById('subtotal').innerText = `৳${subtotal.toLocaleString('bn-BD')}`;
    document.getElementById('total').innerText = `৳${total.toLocaleString('bn-BD')}`;
    document.getElementById('hiddenSubtotal').value = subtotal;
    document.getElementById('hiddenTotal').value = total;

    const productNames = {
      black: 'Nokia 3210 (Black)',
      blue: 'Nokia 3210 (Blue)',
      white: 'Nokia 3210 (White)'
    };
    document.getElementById('hiddenProduct').value = productNames[this.selectedProduct];
    document.getElementById('hiddenQuantity').value = this.quantities[this.selectedProduct];
  },

  // ------------------------------
  // বাটনের স্টেট
  // ------------------------------
  updateButtonsState() {
    const color = this.selectedProduct;
    document.getElementById(`btn-minus-${color}`).disabled = this.quantities[color] <= 1;
  },

  // ------------------------------
  // ফর্ম ভ্যালিডেশন
  // ------------------------------
  validateForm() {
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();

    const nameRegex = /^[A-Za-z\s\u0980-\u09FF]+$/;
    const phoneRegex = /^01[3-9][0-9]{8}$/;
    let valid = true;

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

  // ------------------------------
  // Back to Top
  // ------------------------------
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
};

window.onload = () => App.init();

        // Dactive টাইমার
/*
// 8 ঘন্টা 45 মিনিট টাইমার (সেকেন্ডে কনভার্ট)
let countdownTime = 8 * 60 * 60 + 45 * 60;

// ইংরেজি → বাংলা সংখ্যা রূপান্তর
function toBengaliNumber(num) {
  const bengaliDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  return String(num).split('').map(d => bengaliDigits[d] || d).join('');
}

function updateCountdown() {
  const countdownEl = document.getElementById("countdown");
  if (!countdownEl) return;

  let hours = Math.floor(countdownTime / 3600);
  let minutes = Math.floor((countdownTime % 3600) / 60);
  let seconds = countdownTime % 60;

  const text = `সময় বাকি: ${toBengaliNumber(hours)} ঘন্টা ${toBengaliNumber(minutes)} মিনিট ${toBengaliNumber(seconds)} সেকেন্ড`;

  countdownEl.textContent = text;

  if (countdownTime > 0) {
    countdownTime--;
  } else {
    countdownEl.textContent = "⏰ অফার শেষ!";
  }
}

setInterval(updateCountdown, 1000);
updateCountdown();

*/
           // Active টাইমার

// অফারের শেষ সময় (শুক্রবার রাত ১২টা পর্যন্ত)
const offerEnd = new Date("2025-09-19T23:59:59+06:00").getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const distance = offerEnd - now;

  if (distance <= 0) {
    document.getElementById("countdown").textContent = "⏰ অফার শেষ হয়েছে";
    return;
  }

  let days = Math.floor(distance / (1000 * 60 * 60 * 24));
  let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = Math.floor((distance % (1000 * 60)) / 1000);

  let text = "";
  if (days > 0) text += days + " দিন ";
  text += hours + " ঘণ্টা " + minutes + " মিনিট " + seconds + " সেকেন্ড";

  document.getElementById("countdown").textContent = "সময় বাকি: " + text;
}

setInterval(updateCountdown, 1000);
updateCountdown();