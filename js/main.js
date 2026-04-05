// EXECUTIVE COMPASS - メインJavaScript（ネイビー×シルバーテーマ）

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

/** プログラム紹介動画の URL（#about スライド・#flow の唯一の定義。HTML では src を書かない） */
var EC_PROGRAM_VIDEO_SRC = 'videos/program-video.mp4';

function initProgramVideoSources() {
    var nodes = document.querySelectorAll('video[data-ec-program-video]');
    for (var i = 0; i < nodes.length; i++) {
        var v = nodes[i];
        if (!v.getAttribute('src')) v.src = EC_PROGRAM_VIDEO_SRC;
    }
}

// ページロード時の初期化
document.addEventListener('DOMContentLoaded', function() {
    initProgramVideoSources();
    initKvSwiper();
    initReasonPin();
    initProblemPin();
    initSmoothScroll();
    initScrollAnimations();
    initFormValidation();
    initMobileMenu();
    initParallax();
    initCursorNeedle();
    initCtaFloat();
    initVideoControls();
    initParticipantVoiceModal();
    initHeroStatCounters();
    initContactFieldFocusStyles();
});

// 受講生の声：カードクリックでメッセージモーダル
function initParticipantVoiceModal() {
    var modal = document.getElementById('participantVoiceModal');
    var dialog = document.getElementById('participantVoiceModalDialog');
    var backdrop = modal && modal.querySelector('.participant-voice-modal__backdrop');
    var closeBtn = modal && modal.querySelector('.participant-voice-modal__close');
    var bodyEl = document.getElementById('participantVoiceModalBody');
    var elIndustry = document.getElementById('participantVoiceModalIndustry');
    var elRole = document.getElementById('participantVoiceModalRole');
    var elTitle = document.getElementById('participantVoiceModalTitle');
    var cards = document.querySelectorAll('.participant-voice-card[data-voice-template]');
    if (!modal || !dialog || !bodyEl || !cards.length) return;

    var lastFocus = null;
    var trapHandler = null;

    function getFocusable() {
        var list = modal.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        return Array.prototype.slice.call(list).filter(function (n) {
            return n.offsetParent !== null || n === closeBtn;
        });
    }

    function openModal(card) {
        var tid = card.getAttribute('data-voice-template');
        var tpl = tid ? document.getElementById(tid) : null;
        if (!tpl || !tpl.content) return;

        var industry = card.querySelector('.participant-voice-card__industry');
        var role = card.querySelector('.participant-voice-card__role');
        var headline = card.querySelector('.participant-voice-card__headline');
        if (elIndustry) elIndustry.textContent = industry ? industry.textContent.trim() : '';
        if (elRole) elRole.textContent = role ? role.textContent.trim() : '';
        if (elTitle) elTitle.textContent = headline ? headline.textContent.trim() : '';

        bodyEl.innerHTML = '';
        bodyEl.appendChild(document.importNode(tpl.content, true));

        lastFocus = document.activeElement;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        closeBtn.focus();

        trapHandler = function (e) {
            if (e.key !== 'Tab') return;
            var nodes = getFocusable();
            if (nodes.length === 0) return;
            var first = nodes[0];
            var last = nodes[nodes.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        modal.addEventListener('keydown', trapHandler);
    }

    function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        bodyEl.innerHTML = '';
        if (trapHandler) {
            modal.removeEventListener('keydown', trapHandler);
            trapHandler = null;
        }
        if (lastFocus && typeof lastFocus.focus === 'function') {
            lastFocus.focus();
        }
        lastFocus = null;
    }

    cards.forEach(function (card) {
        card.addEventListener('click', function () {
            openModal(card);
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    modal.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
    });
}

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
            // 1枚の幅(56vw) ぶんだけ横に送る（CSSの .reason-slide width と一致）
            var x = moveProgress * -(slides - 1) * 56;
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

// 課題セクション：ピン止め＋スクロールで4枚が四方から中央写真へ寄る
// data-problem-converge="-1 -1" のように符号で方向（左/上が負）
function initProblemPin() {
    var problemWrap = document.querySelector('.problem-pin-wrap');
    if (!problemWrap) return;

    var headerEl = document.querySelector('.header');
    var ticking = false;
    var reduceMotion = typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    var spreadX = 140;
    var spreadY = 104;

    function parseConverge(card) {
        var raw = card.getAttribute('data-problem-converge');
        if (!raw || typeof raw !== 'string') return { sx: 0, sy: 0 };
        var parts = raw.trim().split(/\s+/);
        return {
            sx: parseFloat(parts[0]) || 0,
            sy: parseFloat(parts[1]) || 0
        };
    }

    function resetProblemAnim() {
        var cards = problemWrap.querySelectorAll('.problem-card[data-problem-converge]');
        var center = problemWrap.querySelector('.problem-center');
        cards.forEach(function (c) { c.style.cssText = ''; });
        if (center) center.style.cssText = '';
    }

    function update() {
        if (window.innerWidth <= 1024) {
            resetProblemAnim();
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
        var progress = reduceMotion ? 1 : easeInOutCubic(rawProgress);

        var cards = problemWrap.querySelectorAll('.problem-card[data-problem-converge]');
        cards.forEach(function (card) {
            var dir = parseConverge(card);
            var tx = dir.sx * spreadX * (1 - progress);
            var ty = dir.sy * spreadY * (1 - progress);
            var op = clamp(0.52 + 0.48 * progress, 0, 1);
            card.style.transform = 'translate3d(' + tx + 'px, ' + ty + 'px, 0)';
            card.style.opacity = String(op);
        });

        var center = problemWrap.querySelector('.problem-center');
        if (center) {
            var scale = 0.93 + 0.07 * progress;
            var op = clamp(0.7 + 0.3 * progress, 0, 1);
            center.style.transform = 'scale(' + scale + ')';
            center.style.opacity = String(op);
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
    function onIntersect(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }
    var defaultOpts = { threshold: 0.08, rootMargin: '0px 0px -80px 0px' };
    var bandOpts = { threshold: 0.02, rootMargin: '0px 0px 8% 0px' };
    var observer = new IntersectionObserver(onIntersect, defaultOpts);
    var bandObserver = new IntersectionObserver(onIntersect, bandOpts);

    document.querySelectorAll('.fade-in:not(.fade-in--band)').forEach(function(el) {
        observer.observe(el);
    });
    document.querySelectorAll('.fade-in--band').forEach(function(el) {
        bandObserver.observe(el);
    });
    document.querySelectorAll('.js-compass-scroll').forEach(function(el) {
        observer.observe(el);
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

// 羅針盤の針カスタムカーソル（ゴールド点滅・スムーズ追随）
function initCursorNeedle() {
    var el = document.getElementById('cursorNeedle');
    if (!el || window.matchMedia('(pointer: coarse)').matches) return;
    document.body.classList.add('cursor-needle-active');
    var x = 0, y = 0, rx = 0, ry = 0;
    function move(e) {
        x = e.clientX;
        y = e.clientY;
        el.classList.add('is-visible');
    }
    function update() {
        rx += (x - rx) * 0.38;
        ry += (y - ry) * 0.38;
        el.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
        requestAnimationFrame(update);
    }
    document.addEventListener('mousemove', move, { passive: true });
    requestAnimationFrame(update);
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
    var PARALLAX_BREAKPOINT = 1024;

    function onParallaxScroll() {
        var scrolled = window.pageYOffset;
        if (window.innerWidth < PARALLAX_BREAKPOINT) {
            if (heroSlider) heroSlider.style.transform = '';
            if (featuresImg) featuresImg.style.transform = '';
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

    }

    onParallaxScroll();
    window.addEventListener('scroll', onParallaxScroll, { passive: true });
    window.addEventListener('resize', function() {
        if (window.innerWidth < PARALLAX_BREAKPOINT) {
            if (heroSlider) heroSlider.style.transform = '';
            if (featuresImg) featuresImg.style.transform = '';
        } else onParallaxScroll();
    });
}

// ヒーロー内の数字カウントアップ（IntersectionObserver で1回だけ・全ページ scroll 負荷を避ける）
function initHeroStatCounters() {
    var heroSection = document.querySelector('.kv');
    if (!heroSection || typeof IntersectionObserver === 'undefined') return;
    var done = false;
    function run() {
        if (done) return;
        done = true;
        var counters = heroSection.querySelectorAll('.metallic-gold');
        counters.forEach(function(counter) {
            var target = counter.textContent;
            if (target.match(/^\d+/) && counter.closest('.grid-cols-3')) {
                var numMatch = target.match(/\d+/);
                if (numMatch) {
                    animateCounter(counter, parseInt(numMatch[0], 10), target);
                }
            }
        });
    }
    var io = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) {
                run();
                io.disconnect();
                return;
            }
        }
    }, { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    io.observe(heroSection);
}

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

function initContactFieldFocusStyles() {
    document.querySelectorAll('input[required], textarea[required], select').forEach(function(field) {
        field.addEventListener('focus', function() {
            this.style.borderColor = 'rgba(201, 169, 97, 0.5)';
            this.style.boxShadow = '0 0 0 3px rgba(201, 169, 97, 0.1)';
        });
        field.addEventListener('blur', function() {
            this.style.boxShadow = 'none';
            if (this.value.trim()) {
                clearFieldError(this);
                if (this.tagName !== 'SELECT') {
                    this.style.borderColor = 'rgba(201, 169, 97, 0.5)';
                }
            } else {
                this.style.borderColor = 'rgba(139, 149, 165, 0.3)';
            }
        });
    });
}

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