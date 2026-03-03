// EXECUTIVE COMPASS - メインJavaScript（ネイビー×シルバーテーマ）

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

// ページロード時の初期化
document.addEventListener('DOMContentLoaded', function() {
    initKvSwiper();
    initProblemPin();
    initReasonPin();
    initSmoothScroll();
    initScrollAnimations();
    initFormValidation();
    initMobileMenu();
    initParallax();
    initCtaFloat();
    initCursorCompass();
    initVideoControls();
});

// ヒーローKV：Swiper（3枚スライド・自動＆クリック・右縦パギネーション）
function initKvSwiper() {
    var sliderEl = document.querySelector('.kv__slider');
    var kvSection = document.querySelector('.kv');
    if (typeof Swiper === 'undefined' || !sliderEl) return;
    var swiper = new Swiper('.kv__slider', {
        loop: true,
        effect: 'fade',
        fadeEffect: { crossFade: true },
        speed: 1000,
        autoplay: { delay: 5000, disableOnInteraction: false },
        allowTouchMove: true,
        pagination: {
            el: '.kv__pagination',
            clickable: true,
            bulletClass: 'kv__dot',
            bulletActiveClass: 'is-active',
            renderBullet: function (_, className) {
                return '<span class="' + className + '"></span>';
            }
        }
    });
    if (kvSection) {
        kvSection.addEventListener('click', function(e) {
            var t = e.target;
            if (t.closest('a') || t.closest('button')) return;
            swiper.slideNext();
        });
    }
}

// 悩み共感セクション：スクロール連動で4枚のカードが中央に寄る
function initProblemPin() {
    var problemWrap = document.querySelector('.problem-pin-wrap');
    if (!problemWrap) return;
    var headerEl = document.querySelector('header');
    var ticking = false;

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    var offsets = [
        { x: -280, y: -200 },
        { x:  280, y: -200 },
        { x: -280, y:  200 },
        { x:  280, y:  200 }
    ];

    function resetCards() {
        var cards = problemWrap.querySelectorAll('.problem-card');
        var center = problemWrap.querySelector('.problem-center');
        cards.forEach(function(c) { c.style.cssText = ''; });
        if (center) center.style.cssText = '';
    }

    function update() {
        if (window.innerWidth <= 768) {
            resetCards();
            ticking = false;
            return;
        }
        var headerH = (headerEl && headerEl.offsetHeight) || 72;
        var scrollY = window.scrollY || window.pageYOffset;
        var activeVh = Math.max(1, window.innerHeight - headerH);
        var rect = problemWrap.getBoundingClientRect();
        var wrapTop = scrollY + rect.top;
        var stickyStart = wrapTop - headerH;
        var total = Math.max(1, problemWrap.offsetHeight - activeVh);
        var rawProgress = clamp((scrollY - stickyStart) / total, 0, 1);
        var progress = easeOutCubic(rawProgress);

        var cards = problemWrap.querySelectorAll('.problem-card');
        cards.forEach(function(card, i) {
            var off = offsets[i];
            var tx = off.x * (1 - progress);
            var ty = off.y * (1 - progress);
            var op = clamp(0.05 + 0.95 * progress, 0, 1);
            card.style.transform = 'translate(' + tx + 'px, ' + ty + 'px)';
            card.style.opacity = op;
        });

        var center = problemWrap.querySelector('.problem-center');
        if (center) {
            var scale = 0.9 + 0.1 * progress;
            var op = clamp(0.35 + 0.65 * progress, 0, 1);
            center.style.transform = 'scale(' + scale + ')';
            center.style.opacity = op;
        }
        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('load', update);
    update();
}

// EXECUTIVE COMPASS とは：ピン止め横スライド（縦スクロール→3枚が横に切り替わり）
function initReasonPin() {
    var wraps = document.querySelectorAll('.reason-pin-wrap');
    if (!wraps.length) return;
    var headerEl = document.querySelector('.header');
    var ticking = false;

    function update() {
        var headerH = (headerEl && headerEl.offsetHeight) || 72;
        var activeVh = Math.max(1, window.innerHeight - headerH);
        var scrollY = window.scrollY || window.pageYOffset;

        var isMobile = window.innerWidth <= 768;
        wraps.forEach(function(wrap) {
            var track = wrap.querySelector('.reason-track');
            if (!track) return;
            if (isMobile) {
                track.style.transform = '';
                return;
            }
            var slides = Number(wrap.dataset.slides || 3);

            var rect = wrap.getBoundingClientRect();
            var wrapTop = scrollY + rect.top;
            var stickyStart = wrapTop - headerH;
            var total = Math.max(1, wrap.offsetHeight - activeVh);
            var currentScroll = scrollY - stickyStart;
            var start = clamp(currentScroll, 0, total);
            var progress = clamp(start / total, 0, 1);

            var leadHold = 0.05;
            var moveProgress = progress <= leadHold ? 0 : (progress - leadHold) / (1 - leadHold);
            var x = moveProgress * -(slides - 1) * 100;
            track.style.transform = 'translate3d(' + x + 'vw, 0, 0)';
        });
        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('load', update);
    update();
}

// スムーススクロール
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 90;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// スクロールアニメーション
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.08,
        rootMargin: '0px 0px -80px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    const fadeElements = document.querySelectorAll('.fade-in, .js-compass-scroll');
    fadeElements.forEach(element => {
        observer.observe(element);
    });
}

// フォームバリデーション
function initFormValidation() {
    const form = document.getElementById('contactForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm(form)) {
                showSuccessMessage();
                form.reset();
            }
        });
    }
}

function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            showFieldError(field);
        } else {
            clearFieldError(field);
        }
    });
    
    // メールアドレスの検証
    const emailField = form.querySelector('input[type="email"]');
    if (emailField && emailField.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
            isValid = false;
            showFieldError(emailField, '有効なメールアドレスを入力してください');
        }
    }
    
    return isValid;
}

function showFieldError(field, message = 'この項目は必須です') {
    clearFieldError(field);
    
    field.classList.add('border-red-500');
    field.classList.remove('border-silver-dark/30');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-400 text-sm mt-2 field-error';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle mr-1"></i>${message}`;
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('border-red-500');
    field.classList.add('border-silver-dark/30');
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function showSuccessMessage() {
    // 成功メッセージを表示
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-28 left-1/2 transform -translate-x-1/2 z-50 animate-bounce';
    successDiv.style.animation = 'fadeInDown 0.5s ease';
    successDiv.innerHTML = `
        <div class="luxury-card px-10 py-6 rounded-2xl border border-gold-accent/50 shadow-2xl">
            <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gradient-to-br from-gold-accent to-yellow-600 rounded-full flex items-center justify-center">
                    <i class="fas fa-check text-navy-dark text-xl"></i>
                </div>
                <div>
                    <div class="font-bold text-lg text-silver-light mb-1">送信完了</div>
                    <div class="text-sm text-silver-medium">担当者より3営業日以内にご連絡いたします</div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(successDiv);
    
    // 5秒後に自動で消す
    setTimeout(() => {
        successDiv.style.opacity = '0';
        successDiv.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            successDiv.remove();
        }, 500);
    }, 5000);
}

// カーソルに追随するコンパス（ヒーロー＋対象者セクション以降のみ表示）
function initCursorCompass() {
    var el = document.getElementById('cursorCompass');
    if (!el || window.matchMedia('(pointer: coarse)').matches) return;
    var hero = document.querySelector('.kv');
    var targetSection = document.getElementById('target');
    var x = 0, y = 0;
    var rx = 0, ry = 0;
    var raf = 0;
    var offset = 0;

    function isInCompassZone(clientY) {
        if (hero) {
            var heroRect = hero.getBoundingClientRect();
            if (clientY >= heroRect.top && clientY <= heroRect.bottom) return true;
        }
        if (targetSection) {
            var targetRect = targetSection.getBoundingClientRect();
            if (clientY >= targetRect.top) return true;
        }
        return false;
    }

    function move(e) {
        x = e.clientX;
        y = e.clientY;
        if (!raf) raf = requestAnimationFrame(update);
    }

    function update() {
        var showCompass = isInCompassZone(y);
        var tx = x + offset;
        var ty = y + offset;
        rx += (tx - rx) * 0.18;
        ry += (ty - ry) * 0.18;
        el.style.left = rx + 'px';
        el.style.top = ry + 'px';
        if (showCompass) {
            el.classList.add('is-visible');
        } else {
            el.classList.remove('is-visible');
        }
        raf = 0;
        if (Math.abs(tx - rx) > 0.5 || Math.abs(ty - ry) > 0.5 || showCompass) {
            raf = requestAnimationFrame(update);
        }
    }

    document.addEventListener('mousemove', move, { passive: true });
}

// 右下「無料体験受付中」ボタン（ふわっと表示）
// 表示までの遅延（秒）
var CTA_FLOAT_DELAY_SEC = 11;
function initCtaFloat() {
    var el = document.getElementById('ctaFloat');
    if (!el) return;
    var delayMs = CTA_FLOAT_DELAY_SEC * 1000;
    function show() {
        el.classList.add('is-visible');
    }
    if (document.readyState === 'complete') {
        setTimeout(show, delayMs);
    } else {
        window.addEventListener('load', function() { setTimeout(show, delayMs); });
    }
}

// プログラム動画：再生・停止・音声切り替え
function initVideoControls() {
    var video = document.getElementById('programVideo');
    var playBtn = document.getElementById('videoPlayPause');
    var muteBtn = document.getElementById('videoMute');
    if (!video || !playBtn || !muteBtn) return;

    var playIcon = playBtn.querySelector('i');
    var muteIcon = muteBtn.querySelector('i');

    playBtn.addEventListener('click', function() {
        if (video.paused) {
            video.play();
            playIcon.classList.remove('fa-play');
            playIcon.classList.add('fa-pause');
        } else {
            video.pause();
            playIcon.classList.remove('fa-pause');
            playIcon.classList.add('fa-play');
        }
    });

    muteBtn.addEventListener('click', function() {
        video.muted = !video.muted;
        muteIcon.classList.toggle('fa-volume-up', !video.muted);
        muteIcon.classList.toggle('fa-volume-mute', video.muted);
    });

    video.addEventListener('play', function() {
        playIcon.classList.remove('fa-play');
        playIcon.classList.add('fa-pause');
    });
    video.addEventListener('pause', function() {
        playIcon.classList.remove('fa-pause');
        playIcon.classList.add('fa-play');
    });

    if (video.muted) {
        muteIcon.classList.remove('fa-volume-up');
        muteIcon.classList.add('fa-volume-mute');
    }
}

// モバイルメニュー（body.menu-open でオーバーレイ表示）
function initMobileMenu() {
    var toggle = document.querySelector('.header__menu-toggle');
    var mobileNav = document.getElementById('mobileNav');
    var navLinks = mobileNav ? mobileNav.querySelectorAll('a') : [];
    if (!toggle || !mobileNav) return;

    function closeMenu() {
        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'メニューを開く');
        mobileNav.setAttribute('aria-hidden', 'true');
    }

    function openMenu() {
        document.body.classList.add('menu-open');
        document.body.style.overflow = 'hidden';
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'メニューを閉じる');
        mobileNav.setAttribute('aria-hidden', 'false');
    }

    toggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (document.body.classList.contains('menu-open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    navLinks.forEach(function(link) {
        link.addEventListener('click', closeMenu);
    });

    mobileNav.addEventListener('click', function(e) {
        if (!e.target.closest('a')) closeMenu();
    });

    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768) closeMenu();
    });
}

// パララックス効果（HERO ＋ 5つの視点画像／PC時・LOSSCAN風）
function initParallax() {
    var hero = document.querySelector('.js-parallax-hero');
    var heroSlider = hero ? hero.querySelector('.kv__slider') : null;
    var featuresImg = document.querySelector('.features-visual .js-parallax-img');
    var featuresSection = document.getElementById('features');
    var problemBg = document.querySelector('.js-parallax-problem-bg');
    var problemWrap = document.querySelector('.problem-story-wrap');
    var PARALLAX_BREAKPOINT = 1024;

    function onParallaxScroll() {
        var scrolled = window.pageYOffset;
        if (window.innerWidth < PARALLAX_BREAKPOINT) {
            if (heroSlider) heroSlider.style.transform = '';
            if (featuresImg) featuresImg.style.transform = '';
            if (problemBg) problemBg.style.transform = '';
            return;
        }

        if (heroSlider && hero) {
            var heroH = hero.offsetHeight;
            heroSlider.style.transform = scrolled <= heroH
                ? 'translateY(' + (scrolled * 0.65) + 'px)'
                : 'translateY(' + (heroH * 0.65) + 'px)';
        }

        if (featuresImg && featuresSection) {
            var rect = featuresSection.getBoundingClientRect();
            var vh = window.innerHeight;
            if (rect.top < vh && rect.bottom > 0) {
                var progress = scrolled - (rect.top + scrolled - vh);
                var offset = Math.max(-120, Math.min(120, progress * 0.35));
                featuresImg.style.transform = 'translateY(' + offset + 'px)';
            } else {
                featuresImg.style.transform = 'translateY(0)';
            }
        }

        if (problemBg && problemWrap) {
            var pRect = problemWrap.getBoundingClientRect();
            var vh = window.innerHeight;
            if (pRect.top < vh && pRect.bottom > 0) {
                var centerY = pRect.top + pRect.height / 2;
                var viewCenter = vh / 2;
                var offset = (centerY - viewCenter) * 0.25;
                problemBg.style.transform = 'translateY(' + clamp(offset, -80, 80) + 'px)';
            } else {
                problemBg.style.transform = 'translateY(0)';
            }
        }
    }

    onParallaxScroll();
    window.addEventListener('scroll', onParallaxScroll, { passive: true });
    window.addEventListener('resize', function() {
        if (window.innerWidth < PARALLAX_BREAKPOINT) {
            if (heroSlider) heroSlider.style.transform = '';
            if (featuresImg) featuresImg.style.transform = '';
            if (problemBg) problemBg.style.transform = '';
        } else onParallaxScroll();
    });
}

// 数字カウントアップアニメーション
const counters = document.querySelectorAll('.metallic-gold');
let counted = false;

window.addEventListener('scroll', function() {
    if (counted) return;
    var heroSection = document.querySelector('.kv');
    if (!heroSection) return;
    var sectionPos = heroSection.getBoundingClientRect().top;
    var screenPos = window.innerHeight;
    if (sectionPos < screenPos && sectionPos > -heroSection.offsetHeight) {
        counters.forEach(function(counter) {
            var target = counter.textContent;
            if (target.match(/^\d+/) && counter.closest('.grid-cols-3')) {
                var numMatch = target.match(/\d+/);
                if (numMatch) {
                    animateCounter(counter, parseInt(numMatch[0], 10), target);
                }
            }
        });
        counted = true;
    }
}, { passive: true });

function animateCounter(element, target, originalText) {
    let current = 0;
    const increment = target / 60;
    const duration = 2000;
    const stepTime = duration / 60;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = originalText;
            clearInterval(timer);
        } else {
            const displayValue = Math.floor(current);
            element.textContent = originalText.replace(/\d+/, displayValue);
        }
    }, stepTime);
}

// フォーム入力時のリアルタイムバリデーション
document.querySelectorAll('input[required], textarea[required], select').forEach(field => {
    field.addEventListener('blur', function() {
        if (this.value.trim()) {
            clearFieldError(this);
            if (this.tagName !== 'SELECT') {
                this.style.borderColor = 'rgba(201, 169, 97, 0.5)';
            }
        } else {
            this.style.borderColor = 'rgba(139, 149, 165, 0.3)';
        }
    });
    
    field.addEventListener('focus', function() {
        this.style.borderColor = 'rgba(201, 169, 97, 0.5)';
        this.style.boxShadow = '0 0 0 3px rgba(201, 169, 97, 0.1)';
    });
    
    field.addEventListener('blur', function() {
        this.style.boxShadow = 'none';
    });
});

// ページ読み込み完了時：ヘッダー背景切り替え ＋ トップへ戻るボタン表示
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    var header = document.querySelector('.header');
    var problemSection = document.getElementById('problem');
    var ticking = false;

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(function() {
                var y = window.pageYOffset;
                if (header && problemSection) {
                    var threshold = problemSection.getBoundingClientRect().top + y - (header.offsetHeight || 72);
                    header.classList.toggle('is-scrolled', y > threshold);
                } else if (header) {
                    header.classList.toggle('is-scrolled', y > 40);
                }
                ticking = false;
            });
            ticking = true;
        }
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
});

// CSS アニメーション追加
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInDown {
        from {
            opacity: 0;
            transform: translate(-50%, -20px);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }
    
    @keyframes shimmer {
        0% {
            background-position: -1000px 0;
        }
        100% {
            background-position: 1000px 0;
        }
    }
    
    .metallic-silver,
    .metallic-gold {
        animation: shimmer 3s infinite linear;
        background-size: 200% auto;
    }
`;
document.head.appendChild(style);