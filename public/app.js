!function() {
    var e = document.createElement("style");
    e.textContent = [ ".card-qty-ctrl{display:flex;align-items:center;gap:0;border-radius:50px;overflow:hidden;border:2px solid #2d6a4f;background:#fff;}", ".card-qty-ctrl button{width:34px;height:38px;background:#2d6a4f;color:#fff;font-size:18px;font-weight:700;border:none;cursor:pointer;line-height:1;transition:background 0.2s;}", ".card-qty-ctrl button:hover{background:#40916c;}", ".card-qty-ctrl .cq-num{min-width:34px;text-align:center;font-size:15px;font-weight:700;color:#2d6a4f;font-family:Inter,sans-serif;}" ].join(""), 
    document.head.appendChild(e);
}();

var toastTimer, cart = [], FREE_SHIPPING_THRESHOLD = 499;

function saveCart() {
    try {
        localStorage.setItem("moringai_cart", JSON.stringify(cart));
    } catch (e) {}
}

function updateMobileBuyBar() {
    var e = document.querySelector(".mobile-buy-bar");
    if (e) {
        var t = document.getElementById("buyBarCount"), a = document.getElementById("buyBarTotal"), r = getCartCount(), n = getCartTotal();
        e.style.display = r > 0 ? "flex" : "none", t && (t.textContent = r + (1 === r ? " item" : " items")), 
        a && (a.textContent = "₹" + n);
    }
}

function getCardQty(e, t) {
    var a = cart.find(function(a) {
        return a.name === e && a.variant === t;
    });
    return a ? a.qty : 0;
}

function getCardPrice(e) {
    var t = e.querySelector(".price-current");
    return t && parseInt(t.textContent.replace(/[^0-9]/g, ""), 10) || 0;
}

function getCardEmoji(e) {
    var t = e.querySelector(".product-emoji");
    return t ? t.textContent.trim() : "🌿";
}

function updateCardButton(e, t) {
    var a = getCardQty(e, t);
    document.querySelectorAll(".product-card").forEach(function(r) {
        if ((r.dataset.name || "") === e) {
            var n = r.querySelector(".product-footer");
            if (!n) return;
            var o = n.querySelector(".add-to-cart, .card-qty-ctrl");
            if (!o) return;
            var i = e.replace(/\\/g, "\\\\").replace(/'/g, "\\'"), d = t.replace(/\\/g, "\\\\").replace(/'/g, "\\'"), c = getCardPrice(r), s = getCardEmoji(r);
            o.outerHTML = 0 === a ? '<button class="add-to-cart" onclick="addToCart(\'' + i + "'," + c + ",'" + s + "',getActiveVariant(this))\">🛒 Add</button>" : '<div class="card-qty-ctrl"><button onclick="cardDecrement(this,\'' + i + "','" + d + '\')">−</button><span class="cq-num">' + a + "</span><button onclick=\"cardIncrement(this,'" + i + "'," + c + ",'" + s + "','" + d + "')\">+</button></div>";
        }
    });
}

function cardIncrement(e, t, a, r, n) {
    var o = cart.find(function(e) {
        return e.name === t && e.variant === n;
    });
    o ? o.qty += 1 : cart.push({
        name: t,
        price: a,
        emoji: r,
        variant: n,
        qty: 1
    }), saveCart(), updateCartUI(), updateCardButton(t, n), showToast("✅ " + t + " added!");
}

function cardDecrement(e, t, a) {
    var r = cart.findIndex(function(e) {
        return e.name === t && e.variant === a;
    });
    -1 !== r && (cart[r].qty -= 1, cart[r].qty <= 0 && cart.splice(r, 1), saveCart(), 
    updateCartUI(), updateCardButton(t, a));
}

function addToCart(e, t, a, r) {
    var n = cart.find(function(t) {
        return t.name === e && t.variant === r;
    });
    n ? n.qty += 1 : cart.push({
        name: e,
        price: t,
        emoji: a,
        variant: r,
        qty: 1
    }), saveCart(), updateCartUI(), updateCardButton(e, r), showToast("✅ " + e + " added to cart!");
    var o = document.getElementById("cartToggle");
    o && (o.style.transform = "scale(1.3)", setTimeout(function() {
        o.style.transform = "";
    }, 300));
}

function removeFromCart(e, t) {
    cart = cart.filter(function(a) {
        return !(a.name === e && a.variant === t);
    }), saveCart(), updateCartUI(), updateCardButton(e, t);
}

function changeQty(e, t, a) {
    var r = cart.find(function(a) {
        return a.name === e && a.variant === t;
    });
    r && (r.qty += a, r.qty <= 0 && (cart = cart.filter(function(a) {
        return !(a.name === e && a.variant === t);
    })), saveCart(), updateCartUI(), updateCardButton(e, t));
}

function getCartTotal() {
    return cart.reduce(function(e, t) {
        return e + t.price * t.qty;
    }, 0);
}

function getCartCount() {
    return cart.reduce(function(e, t) {
        return e + t.qty;
    }, 0);
}

function updateCartUI() {
    var e = getCartTotal(), t = getCartCount(), a = document.getElementById("cartBadge");
    a && (a.textContent = t, a.style.display = t > 0 ? "flex" : "none");
    var r = document.getElementById("cartBody"), n = document.getElementById("cartFooter");
    if (r) {
        if (0 === cart.length) r.innerHTML = '<div style="text-align:center;padding:48px 16px;color:#888"><div style="font-size:48px;margin-bottom:12px">🛒</div><p>Your cart is empty</p></div>', 
        n && (n.innerHTML = ""); else {
            var o = "";
            cart.forEach(function(e) {
                var t = e.name.replace(/"/g, "&quot;"), a = e.variant.replace(/"/g, "&quot;");
                o += '<div style="display:flex;gap:12px;align-items:center;padding:14px 0;border-bottom:1px solid #f0f0f0"><div style="font-size:32px;width:48px;text-align:center">' + e.emoji + '</div><div style="flex:1"><div style="font-weight:600;font-size:14px">' + e.name + '</div><div style="font-size:12px;color:#888;margin:2px 0">' + e.variant + '</div><div style="display:flex;align-items:center;gap:12px;margin-top:6px"><span style="font-weight:700;color:#2d6a4f">₹' + e.price * e.qty + '</span><div style="display:flex;align-items:center;gap:6px"><button onclick="changeQty(&quot;' + t + "&quot;,&quot;" + a + '&quot;,-1)" style="width:28px;height:28px;border-radius:50%;border:1px solid #2d6a4f;background:#fff;color:#2d6a4f;font-size:16px;cursor:pointer">−</button><span style="font-weight:600;min-width:20px;text-align:center">' + e.qty + '</span><button onclick="changeQty(&quot;' + t + "&quot;,&quot;" + a + '&quot;,1)" style="width:28px;height:28px;border-radius:50%;border:none;background:#2d6a4f;color:#fff;font-size:16px;cursor:pointer">+</button></div><button onclick="removeFromCart(&quot;' + t + "&quot;,&quot;" + a + '&quot;)" style="background:none;border:none;cursor:pointer;font-size:18px;color:#ccc">🗑</button></div></div></div>';
            }), r.innerHTML = '<div style="padding:0 16px">' + o + "</div>";
            var i = e >= FREE_SHIPPING_THRESHOLD ? 0 : 49, d = FREE_SHIPPING_THRESHOLD - e, c = Math.min(100, Math.round(e / FREE_SHIPPING_THRESHOLD * 100)), s = 0 === i ? '<div style="padding:10px 14px;margin-bottom:12px;background:#f0fff8;border-radius:12px;border:1px solid #b7e4c7;font-size:13px;color:#1b4332;font-weight:600;text-align:center">🎉 You got FREE delivery!</div>' : '<div style="padding:10px 14px;margin-bottom:12px;background:#fafafa;border-radius:12px;border:1px solid #eee"><div style="font-size:12px;color:#888;margin-bottom:6px">Add ₹' + d + ' more for <strong style="color:#2d6a4f">FREE delivery</strong></div><div style="height:6px;background:#e8e8e8;border-radius:50px;overflow:hidden"><div style="height:100%;width:' + c + '%;background:linear-gradient(90deg,#52b788,#40916c);border-radius:50px;transition:width 0.4s ease"></div></div></div>';
            n && (n.innerHTML = '<div style="padding:16px">' + s + '<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:#888">Subtotal</span><span>₹' + e + '</span></div><div style="display:flex;justify-content:space-between;margin-bottom:12px"><span style="color:#888">Shipping</span><span style="color:' + (0 === i ? "#2d6a4f" : "#333") + '">' + (0 === i ? "FREE" : "₹49") + '</span></div><div style="display:flex;justify-content:space-between;font-weight:700;font-size:17px;margin-bottom:16px"><span>Total</span><span style="color:#2d6a4f">₹' + (e + i) + '</span></div><button onclick="openCheckout()" style="width:100%;padding:16px;background:#1b4332;color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer">Checkout →</button></div>');
        }
        updateMobileBuyBar();
    }
}

function openCart() {
    var e = document.getElementById("cartDrawer"), t = document.getElementById("cartOverlay");
    e && e.classList.add("open"), t && t.classList.add("open"), document.body.style.overflow = "hidden";
}

function closeCart() {
    var e = document.getElementById("cartDrawer"), t = document.getElementById("cartOverlay");
    e && e.classList.remove("open"), t && t.classList.remove("open"), document.body.style.overflow = "";
}

function openCheckout() {
    if (0 !== cart.length) {
        closeCart();
        var e = getCartTotal(), t = e + (e >= FREE_SHIPPING_THRESHOLD ? 0 : 49), a = cart.map(function(e) {
            return '<div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px"><span>' + e.name + " ×" + e.qty + "</span><span>₹" + e.price * e.qty + "</span></div>";
        }).join(""), r = document.getElementById("checkoutBody");
        if (r) {
            r.innerHTML = '<form id="checkoutForm" style="padding:0 4px"><h4 style="margin-bottom:16px;color:#1b4332">Delivery Details</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px"><input id="cfName" placeholder="Full Name *" required style="padding:12px;border:1.5px solid #ddd;border-radius:10px;font-size:14px;font-family:inherit"><input id="cfPhone" type="tel" placeholder="Phone *" required style="padding:12px;border:1.5px solid #ddd;border-radius:10px;font-size:14px;font-family:inherit"></div><input id="cfEmail" type="email" placeholder="Email" style="width:100%;padding:12px;border:1.5px solid #ddd;border-radius:10px;font-size:14px;margin-bottom:10px;box-sizing:border-box;font-family:inherit"><input id="cfAddress" placeholder="Full Address *" required style="width:100%;padding:12px;border:1.5px solid #ddd;border-radius:10px;font-size:14px;margin-bottom:10px;box-sizing:border-box;font-family:inherit"><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px"><input id="cfCity" placeholder="City" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;font-size:14px;font-family:inherit"><input id="cfPin" placeholder="PIN Code" maxlength="6" style="padding:12px;border:1.5px solid #ddd;border-radius:10px;font-size:14px;font-family:inherit"></div><h4 style="margin-bottom:12px;color:#1b4332">Order Summary</h4><div style="background:#f7faf8;border-radius:10px;padding:12px;margin-bottom:16px">' + a + '<div style="border-top:1px solid #ddd;margin-top:8px;padding-top:8px;display:flex;justify-content:space-between;font-weight:700"><span>Total</span><span style="color:#2d6a4f">₹' + t + '</span></div></div><h4 style="margin-bottom:10px;color:#1b4332">Payment Method</h4><div style="display:flex;gap:10px;margin-bottom:20px"><label style="flex:1;padding:12px;border:1.5px solid #2d6a4f;border-radius:10px;cursor:pointer;display:flex;align-items:center;gap:8px;background:#f0fff8"><input type="radio" name="payMethod" value="cod" checked> 💵 Cash on Delivery</label><label style="flex:1;padding:12px;border:1.5px solid #ddd;border-radius:10px;cursor:pointer;display:flex;align-items:center;gap:8px"><input type="radio" name="payMethod" value="razorpay"> 💳 Online Pay</label></div><button type="button" id="placeOrderBtn" style="width:100%;padding:16px;background:#1b4332;color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer">✅ Place Order</button></form>', 
            r.querySelectorAll('input[name="payMethod"]').forEach(function(e) {
                e.addEventListener("change", function() {
                    r.querySelectorAll("label").forEach(function(e) {
                        e.style.border = "1.5px solid #ddd", e.style.background = "";
                    }), e.parentElement.style.border = "1.5px solid #2d6a4f", e.parentElement.style.background = "#f0fff8";
                });
            }), document.getElementById("placeOrderBtn").addEventListener("click", placeOrder);
            var n = document.getElementById("checkoutModal"), o = document.getElementById("checkoutOverlay");
            n && n.classList.add("open"), o && o.classList.add("open"), document.body.style.overflow = "hidden";
        }
    } else showToast("⚠️ Your cart is empty!");
}

function closeCheckoutModal() {
    var e = document.getElementById("checkoutModal"), t = document.getElementById("checkoutOverlay");
    e && e.classList.remove("open"), t && t.classList.remove("open"), document.body.style.overflow = "";
}

async function placeOrder() {
    const value = id => (document.getElementById(id)?.value || '').trim();
    const name = value('cfName'), phone = value('cfPhone'), email = value('cfEmail');
    const address = value('cfAddress'), city = value('cfCity'), pin = value('cfPin');
    if (name.length < 2 || !/^(?:\+91)?[6-9]\d{9}$/.test(phone.replace(/\s/g, '')) || address.length < 5 || !city || !/^[1-9]\d{5}$/.test(pin) ||
        (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
        showToast('Please enter a valid name, mobile number, full address, city and 6-digit PIN code.');
        return;
    }
    if (!cart.length) { showToast('Your cart is empty.'); return; }
    const method = document.querySelector('input[name="payMethod"]:checked')?.value || 'cod';
    const order = {
        customer: { name, phone, email, address: address + ', ' + city + ' – ' + pin },
        items: cart.map(i => ({name:i.name,variant:i.variant,qty:i.qty,price:i.price})),
        paymentMethod: method
    };
    const button = document.getElementById('placeOrderBtn');
    if (button?.disabled) return;
    if (button) { button.disabled = true; button.textContent = 'Placing order…'; }
    try {
        let data;
        if (method === 'razorpay') {
            data = await startRazorpayPayment(order.items, order);
        } else {
            const response = await fetch('/api/orders', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(order)});
            data = await response.json();
            if (!response.ok || !data.success || !data.order?.id) throw new Error(data.error || 'Order could not be saved. Please try again.');
        }
        if (!data?.success || !data.order?.id) throw new Error('Order confirmation is unavailable. Please contact us.');
        closeCheckoutModal(); cart = []; updateCartUI();
        showToast('Order placed! ID: ' + data.order.id + '. We’ll contact you with updates.');
    } catch (error) {
        showToast(error.message || 'Could not place your order. Your cart has been saved. Please try again.');
    } finally {
        if (button) { button.disabled = false; button.textContent = 'Place Order'; }
    }
}

function filterProducts(e) {
    document.querySelectorAll(".filter-btn").forEach(function(t) {
        t.classList.toggle("active", t.dataset.filter === e);
    }), document.querySelectorAll(".product-card").forEach(function(t) {
        var a = "all" === e || t.dataset.category === e;
        t.style.display = a ? "" : "none";
    });
}

function getActiveVariant(e) {
    var t = e.closest && e.closest(".product-card");
    if (!t) return "100g";
    var a = t.querySelector(".variant-btn.active");
    return a ? a.textContent.trim() : "100g";
}

function selectVariant(e) {
    var t = e.closest(".product-card");
    t && (t.querySelectorAll(".variant-btn").forEach(function(e) {
        e.classList.remove("active");
    }), e.classList.add("active"));
}

function showToast(e) {
    var t = document.getElementById("toast");
    t && (t.textContent = e, t.classList.add("show"), clearTimeout(toastTimer), toastTimer = setTimeout(function() {
        t.classList.remove("show");
    }, 3200));
}

function closeMobileMenu() {
    var e = document.getElementById("mobileMenu");
    e && e.classList.remove("open");
    var t = document.getElementById("mobileMenuOverlay");
    t && t.classList.remove("open");
}

!function() {
    try {
        var e = localStorage.getItem("moringai_cart");
        e && (cart = JSON.parse(e) || []);
    } catch (e) {
        cart = [];
    }
}(), function() {
    var e = !1;
    function t() {
        if (!e) {
            e = !0;
            var t = document.getElementById("preloader");
            t && (t.classList.add("hidden"), setTimeout(function() {
                t.parentNode && t.parentNode.removeChild(t);
            }, 350)), document.body.classList.remove("loading");
        }
    }
    window.addEventListener("load", function() {
        setTimeout(t, 300);
    }), setTimeout(t, 2500), window.location.hash && document.addEventListener("DOMContentLoaded", function() {
        var e = document.querySelector(window.location.hash);
        e && e.scrollIntoView({
            behavior: "instant",
            block: "start"
        });
    });
}(), document.addEventListener("DOMContentLoaded", function() {
    var e = document.getElementById("cartToggle");
    e && e.addEventListener("click", openCart);
    var t = document.getElementById("cartClose");
    t && t.addEventListener("click", closeCart);
    var a = document.getElementById("cartOverlay");
    a && a.addEventListener("click", closeCart);
    var r = document.getElementById("checkoutBack");
    r && r.addEventListener("click", closeCheckoutModal);
    var n = document.getElementById("checkoutClose");
    n && n.addEventListener("click", closeCheckoutModal);
    var o = document.getElementById("checkoutOverlay");
    o && o.addEventListener("click", closeCheckoutModal);
    var i = document.getElementById("menuToggle");
    i && i.addEventListener("click", function() {
        var e = document.getElementById("mobileMenu"), t = document.getElementById("mobileMenuOverlay");
        e && e.classList.toggle("open"), t && t.classList.toggle("open", e && e.classList.contains("open"));
    });
    var d = document.getElementById("mobileMenuOverlay");
    d && d.addEventListener("click", closeMobileMenu), document.querySelectorAll(".mobile-nav-link").forEach(function(e) {
        e.addEventListener("click", closeMobileMenu);
    });
    var c = document.querySelector("header");
    if (c && window.addEventListener("scroll", function() {
        var e = window.scrollY > 10;
        c.style.boxShadow = e ? "0 4px 30px rgba(0,0,0,0.28)" : "", c.style.background = e ? "rgba(6,13,8,0.98)" : "";
    }, {
        passive: !0
    }), renderProducts(), renderReviews(), updateCartUI(), cart.forEach(function(e) {
        updateCardButton(e.name, e.variant);
    }), "IntersectionObserver" in window) {
        var s = new IntersectionObserver(function(e) {
            e.forEach(function(e) {
                e.isIntersecting && (e.target.classList.add("visible"), s.unobserve(e.target));
            });
        }, {
            threshold: .1
        });
        document.querySelectorAll(".fade-in").forEach(function(e) {
            s.observe(e);
        });
    } else document.querySelectorAll(".fade-in").forEach(function(e) {
        e.classList.add("visible");
    });
});

var PRODUCTS = [ {
    slug: "moringa-leaf-powder",
    name: "Moringa Leaf Powder",
    nameTa: "மொரிங்கை இலைப் பொடி",
    emoji: "🌿",
    category: "powder",
    price: 299,
    oldPrice: 399,
    badge: "BESTSELLER",
    badgeTa: "சிறந்த விற்பனை",
    desc: "100% pure sun-dried moringa leaf powder, cold processed to preserve nutrients.",
    descTa: "100% தூய வெயிலில் உலர்த்தப்பட்ட மொரிங்கை இலைப் பொடி. அதிகபட்ச ஊட்டச்சத்தை தக்கவைக்க குளிர் முறையில் தயாரிக்கப்பட்டது.",
    variants: [ "100g", "200g", "500g" ]
}, {
    slug: "moringa-capsules",
    name: "Moringa Capsules",
    nameTa: "மொரிங்கை காப்சூல்கள்",
    emoji: "💊",
    category: "capsules",
    price: 399,
    oldPrice: 499,
    badge: "NEW",
    badgeTa: "புதியது",
    desc: "500mg pure moringa leaf powder per capsule. 60 capsules per bottle.",
    descTa: "ஒரு காப்சூலுக்கு 500mg தூய மொரிங்கை. ஒரு பாட்டிலில் 60 காப்சூல்கள். தினசரி ஆரோக்கியத்திற்கு எளிதான வழி.",
    variants: [ "60 caps", "120 caps" ]
}, {
    slug: "moringa-tea-blend",
    name: "Moringa Tea Blend",
    nameTa: "மொரிங்கை தேநீர் கலவை",
    emoji: "🍵",
    category: "tea",
    price: 249,
    oldPrice: 329,
    badge: "SALE",
    badgeTa: "சலுகை",
    desc: "Moringa green tea blend with tulsi and ginger. 20 biodegradable tea bags.",
    descTa: "துளசி மற்றும் இஞ்சியுடன் கூடிய இதமான மொரிங்கை பச்சை தேநீர் கலவை. 20 மண் மறையும் பைகள்.",
    variants: [ "20 bags", "40 bags" ]
}, {
    slug: "moringa-seed-oil",
    name: "Moringa Seed Oil",
    nameTa: "மொரிங்கை விதை எண்ணெய்",
    emoji: "✨",
    category: "oil",
    price: 549,
    oldPrice: 699,
    badge: "PREMIUM",
    badgeTa: "பிரீமியம்",
    desc: "Cold-pressed moringa seed oil for skin and hair, rich in oleic acid.",
    descTa: "தோல் & முடிக்கான குளிர் அழுத்தப்பட்ட மொரிங்கை விதை எண்ணெய். ஒலிக் அமிலம் மற்றும் ஆன்டிஆக்ஸிடன்ட் நிறைந்தது.",
    variants: [ "30ml", "60ml", "100ml" ]
}, {
    slug: "moringa-gift-set",
    name: "Moringa Gift Set",
    nameTa: "மொரிங்கை பரிசு தொகுப்பு",
    emoji: "🎁",
    category: "gift",
    price: 799,
    oldPrice: 999,
    badge: "GIFT",
    badgeTa: "பரிசு",
    desc: "A curated set — Moringa Powder, Capsules and Tea — for gifting.",
    descTa: "தேர்ந்தெடுக்கப்பட்ட பரிசு தொகுப்பு: பொடி + காப்சூல்கள் + தேநீர். ஆரோக்கியத்தை பரிசாக அளிக்க சிறந்தது.",
    variants: [ "Standard", "Premium" ]
}, {
    slug: "raw-moringa-seeds",
    name: "Raw Moringa Seeds",
    nameTa: "மொரிங்கை மூல விதைகள்",
    emoji: "🌱",
    category: "seeds",
    price: 199,
    oldPrice: 249,
    badge: "",
    badgeTa: "",
    desc: "Hand-picked raw moringa seeds for planting or direct consumption.",
    descTa: "நடவு செய்ய அல்லது நேரடியாக உண்ண கைத்தேர்வு செய்யப்பட்ட மூல மொரிங்கை விதைகள்.",
    variants: [ "50g", "100g", "250g" ]
} ], PRODUCT_CATEGORY_TA = {
    powder: "பொடி",
    capsules: "காப்சூல்கள்",
    tea: "தேநீர்",
    oil: "எண்ணெய்",
    gift: "பரிசு",
    seeds: "விதைகள்"
}, REVIEWS = [];

function renderProducts() {
    var e = document.getElementById("productsGrid");
    if (e) {
        var t = "ta" === (window.MoringaiI18N && window.MoringaiI18N.getLang() || "en");
        e.innerHTML = PRODUCTS.map(function(e) {
            var a = e.variants.map(function(e, t) {
                return '<button class="variant-btn' + (0 === t ? " active" : "") + '" onclick="selectVariant(this)">' + e + "</button>";
            }).join(""), r = Math.round((e.oldPrice - e.price) / e.oldPrice * 100), n = e.name.replace(/'/g, "\\'"), o = t && e.nameTa ? e.nameTa : e.name, i = t && e.descTa ? e.descTa : e.desc, d = t && e.badgeTa ? e.badgeTa : e.badge, c = t && PRODUCT_CATEGORY_TA[e.category] ? PRODUCT_CATEGORY_TA[e.category] : e.category.toUpperCase(), s = t ? "🛒 சேர்" : "🛒 Add", l = t ? "% தள்ளுபடி" : "% off", u = "/products/" + e.slug;
            return '<div class="product-card fade-in" data-name="' + e.name + '" data-category="' + e.category + '"><a href="' + u + '" class="product-img" aria-label="' + o + '"><span class="product-emoji">' + e.emoji + "</span>" + (d ? '<span class="product-badge">' + d + "</span>" : "") + '</a><div class="product-info"><div class="product-meta"><span class="product-category">' + c + '</span></div><h3 class="product-name"><a href="' + u + '">' + o + '</a></h3><p class="product-desc">' + i + '</p><div class="product-variants">' + a + '</div><div class="product-footer"><div class="product-price"><span class="price-current">₹' + e.price + '</span><span class="price-old">₹' + e.oldPrice + '</span><span class="price-save">' + r + l + '</span></div><button class="add-to-cart" onclick="addToCart(\'' + n + "'," + e.price + ",'" + e.emoji + "',getActiveVariant(this))\">" + s + "</button></div></div></div>";
        }).join("");
    }
}

function renderReviews() {
    var e = document.getElementById("reviewsGrid");
    if (e) if (REVIEWS.length) e.innerHTML = REVIEWS.map(function(e) {
        var t = "⭐".repeat(e.rating);
        return '<div class="review-card fade-in"><div class="review-header"><span class="review-avatar">' + e.avatar + '</span><div><div class="review-name">' + e.name + '</div><div class="review-location">📍 ' + e.location + '</div></div><div class="review-stars" style="margin-left:auto">' + t + '</div></div><p class="review-text">' + e.text + "</p></div>";
    }).join(""); else {
        var t = "ta" === (window.MoringaiI18N && window.MoringaiI18N.getLang() || "en");
        e.innerHTML = '<div class="reviews-empty" style="grid-column:1/-1;text-align:center;padding:32px 20px"><p style="font-size:16px;font-weight:600;margin-bottom:8px">' + (t ? "நாங்கள் இன்னும் புதிய பிராண்ட் — சரிபார்க்கப்பட்ட மதிப்புரைகள் விரைவில் இங்கே தோன்றும்." : "We're a young brand — verified customer reviews will appear here soon.") + '</p><p style="opacity:.75">' + (t ? "WhatsApp மூலம் உங்கள் அனுபவத்தைப் பகிரவும், நாங்கள் அதை இங்கே சேர்ப்போம்." : "Bought from us? Share your experience on WhatsApp and we'll feature it here once verified.") + "</p></div>";
    }
}