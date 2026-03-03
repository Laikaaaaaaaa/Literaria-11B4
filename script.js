/* ============================================
   11B4 LITERARIA - Shared JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // --- WebView detection warning ---
  function isLikelyInAppWebView() {
    const userAgent = navigator.userAgent || '';
    const isAndroid = /Android/i.test(userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);

    const isAndroidWebView = isAndroid && (
      /\bwv\b/i.test(userAgent) ||
      /; wv\)/i.test(userAgent) ||
      /Version\/\d+\.\d+.*Chrome\//i.test(userAgent) ||
      /WebView/i.test(userAgent)
    );

    const isIOSSafari = isIOS && /Safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser/i.test(userAgent);
    const isIOSWebView = isIOS && /AppleWebKit/i.test(userAgent) && !isIOSSafari;

    const inAppBrowserTokens = /FBAN|FBAV|Instagram|Line\/|MicroMessenger|Zalo|TikTok|Pinterest|Snapchat|GSA\//i.test(userAgent);

    return isAndroidWebView || isIOSWebView || inAppBrowserTokens;
  }

  function showWebViewWarning() {
    if (document.querySelector('.webview-warning')) {
      return;
    }

    const popup = document.createElement('div');
    popup.className = 'webview-warning';
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-live', 'polite');
    popup.setAttribute('aria-label', 'Khuyến nghị mở bằng trình duyệt');

    popup.innerHTML = `
      <div class="webview-warning-message">Ứng dụng hoạt động tốt nhất trên trình duyệt.</div>
      <div class="webview-warning-actions">
        <a class="webview-warning-open" href="${window.location.href}" target="_blank" rel="noopener noreferrer">Mở bằng trình duyệt</a>
        <button type="button" class="webview-warning-close" aria-label="Đóng thông báo">Đóng</button>
      </div>
    `;

    document.body.appendChild(popup);

    const closeButton = popup.querySelector('.webview-warning-close');
    if (closeButton) {
      closeButton.addEventListener('click', function () {
        popup.remove();
      });
    }

    const openButton = popup.querySelector('.webview-warning-open');
    if (openButton) {
      openButton.addEventListener('click', function () {
        const openedWindow = window.open(window.location.href, '_blank', 'noopener,noreferrer');
        if (!openedWindow) {
          window.location.href = window.location.href;
        }
      });
    }
  }

  if (isLikelyInAppWebView()) {
    showWebViewWarning();
  }

  // --- Navbar scroll effect ---
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // --- Mobile menu toggle ---
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.navbar-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
      // Animate hamburger
      menuToggle.classList.toggle('active');
    });
    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        menuToggle.classList.remove('active');
      });
    });
  }

  // --- Scroll fade-in (Intersection Observer) ---
  const fadeElements = document.querySelectorAll('.fade-in, .reveal-lift');
  if (fadeElements.length > 0) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // --- Home page: sequential fade-in on load ---
  const homeSequence = document.querySelectorAll('.home-sequence');
  homeSequence.forEach(function (el, i) {
    setTimeout(function () {
      el.classList.add('visible');
    }, 300 + i * 250);
  });

  const touchInteractiveElements = document.querySelectorAll('.home-actions a, .home-journey-link, .home-rail-link');
  if (touchInteractiveElements.length > 0 && window.matchMedia('(hover: none)').matches) {
    touchInteractiveElements.forEach(function (element) {
      let touchFeedbackTimer;

      element.addEventListener('pointerdown', function () {
        if (touchFeedbackTimer) {
          clearTimeout(touchFeedbackTimer);
        }
        element.classList.add('touch-hover');
      });

      element.addEventListener('pointerup', function () {
        if (touchFeedbackTimer) {
          clearTimeout(touchFeedbackTimer);
        }
        touchFeedbackTimer = setTimeout(function () {
          element.classList.remove('touch-hover');
        }, 220);
      });

      element.addEventListener('pointercancel', function () {
        element.classList.remove('touch-hover');
      });

      element.addEventListener('pointerleave', function () {
        element.classList.remove('touch-hover');
      });
    });
  }

  // --- Home page: rotating typing quote ---
  const typingQuote = document.querySelector('.typing-quote');
  const typingQuoteAuthor = document.querySelector('.typing-quote-author');
  if (typingQuote) {
    const quoteList = (typingQuote.getAttribute('data-quotes') || '')
      .split('|')
      .map(function (item) { return item.trim(); })
      .filter(Boolean);

    const authorList = (typingQuote.getAttribute('data-authors') || '')
      .split('|')
      .map(function (item) { return item.trim(); });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (quoteList.length > 0) {
      if (prefersReducedMotion) {
        typingQuote.textContent = `“${quoteList[0]}”`;
        if (typingQuoteAuthor) {
          typingQuoteAuthor.textContent = `— ${authorList[0] || 'Khuyết danh'} —`;
        }
      } else {
        let quoteIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let pauseTimeoutId;
        const typeSpeed = 68;
        const deleteSpeed = 34;
        const pauseAfterTyped = 3200;
        const pauseBeforeNextQuote = 700;

        function typeQuote() {
          const currentQuote = quoteList[quoteIndex];
          const currentAuthor = authorList[quoteIndex] || 'Khuyết danh';

          if (!isDeleting) {
            charIndex += 1;
          } else {
            charIndex -= 1;
          }

          typingQuote.textContent = `“${currentQuote.slice(0, Math.max(charIndex, 0))}”`;
          if (typingQuoteAuthor) {
            typingQuoteAuthor.textContent = `— ${currentAuthor} —`;
          }

          if (!isDeleting && charIndex >= currentQuote.length) {
            pauseTimeoutId = setTimeout(function () {
              isDeleting = true;
              typeQuote();
            }, pauseAfterTyped);
            return;
          }

          if (isDeleting && charIndex <= 0) {
            isDeleting = false;
            quoteIndex = (quoteIndex + 1) % quoteList.length;
            pauseTimeoutId = setTimeout(typeQuote, pauseBeforeNextQuote);
            return;
          }

          const speed = isDeleting ? deleteSpeed : typeSpeed;
          pauseTimeoutId = setTimeout(typeQuote, speed);
        }

        typingQuote.textContent = '';
        setTimeout(typeQuote, 800);

        window.addEventListener('beforeunload', function () {
          if (pauseTimeoutId) {
            clearTimeout(pauseTimeoutId);
          }
        });
      }
    }
  }

  // --- Dreams page: Modal ---
  const galleryCards = document.querySelectorAll('[data-modal]');
  const modalOverlay = document.querySelector('.modal-overlay');
  const modalClose = document.querySelector('.modal-close');
  const lazyMediaTargets = document.querySelectorAll('[data-lazy-src], [data-thumb-src]');

  if (galleryCards.length > 0 && modalOverlay) {
    // Lazy-load thumbnails and poster frames to reduce initial weight
    if (lazyMediaTargets.length > 0 && 'IntersectionObserver' in window) {
      const lazyObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          const target = entry.target;
          const lazySrc = target.getAttribute('data-lazy-src');
          const thumbSrc = target.getAttribute('data-thumb-src');

          if (lazySrc) {
            target.setAttribute('src', lazySrc);
            target.removeAttribute('data-lazy-src');
          }

          if (thumbSrc && target.tagName.toLowerCase() === 'video') {
            target.preload = 'metadata';
            target.setAttribute('src', thumbSrc);
            target.load();
            target.removeAttribute('data-thumb-src');
          }

          observer.unobserve(target);
        });
      }, { threshold: 0.15, rootMargin: '0px 0px 120px 0px' });

      lazyMediaTargets.forEach(function (el) { lazyObserver.observe(el); });
    }

    galleryCards.forEach(function (card) {
      card.addEventListener('click', function () {
        const type = card.getAttribute('data-type') || 'image';
        const src = card.getAttribute('data-src') || '';
        const title = card.getAttribute('data-title') || '';
        const author = card.getAttribute('data-author') || '';
        const desc = card.getAttribute('data-desc') || '';

        const mediaContainer = modalOverlay.querySelector('.modal-media');
        const infoContainer = modalOverlay.querySelector('.modal-info');

        // Clear previous
        mediaContainer.innerHTML = '';

        if (type === 'video') {
          const video = document.createElement('video');
          video.src = src;
          video.controls = true;
          video.autoplay = true;
          video.preload = 'metadata';
          mediaContainer.appendChild(video);
        } else if (type === 'audio') {
          const audioWrap = document.createElement('div');
          audioWrap.className = 'audio-player';

          const audio = document.createElement('audio');
          audio.src = src;
          audio.controls = true;
          audio.autoplay = true;
          audio.preload = 'metadata';

          const label = document.createElement('div');
          label.className = 'audio-label';
          label.textContent = 'Đang phát';

          audioWrap.appendChild(audio);
          audioWrap.appendChild(label);
          mediaContainer.appendChild(audioWrap);
        } else {
          const img = document.createElement('img');
          img.src = src;
          img.alt = title;
          img.loading = 'lazy';
          mediaContainer.appendChild(img);
        }

        infoContainer.querySelector('h3').textContent = title;
        infoContainer.querySelector('.modal-author').textContent = author;
        infoContainer.querySelector('.modal-desc').textContent = desc;

        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    // Close modal
    function closeModal() {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';

      const mediaContainer = modalOverlay.querySelector('.modal-media');
      if (mediaContainer) {
        mediaContainer.querySelectorAll('video, audio').forEach(function (el) {
          el.pause();
          el.removeAttribute('src');
          if (el.load) el.load();
        });
        mediaContainer.innerHTML = '';
      }
    }

    if (modalClose) {
      modalClose.addEventListener('click', closeModal);
    }

    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeModal();
      }
    });
  }

  // --- Lesson detail page (lesson.html?id=...) ---
  const lessonDetailContainer = document.getElementById('lesson-detail');
  if (lessonDetailContainer) {
    const lessonDatabase = {
      '1': {
        meta: 'Bài 1 — Văn học trung đại Việt Nam',
        title: 'Độc Tiểu Thanh ký — Nguyễn Du',
        body: `
          <p>“Độc Tiểu Thanh ký” là bài thơ chữ Hán của Nguyễn Du, viết về niềm thương cảm trước số phận của nàng Tiểu Thanh — một người con gái tài sắc nhưng bạc mệnh. Qua đó, Nguyễn Du gửi gắm nỗi niềm về thân phận của những con người tài hoa trong xã hội phong kiến.</p>
          <blockquote>
            “Chẳng biết ba trăm năm lẻ nữa,<br>
            Người đời ai khóc Tố Như chăng?”
            <cite>— Nguyễn Du, Độc Tiểu Thanh ký</cite>
          </blockquote>
          <p>Bài thơ không chỉ là tiếng khóc cho Tiểu Thanh, mà còn là tiếng khóc cho chính mình, cho tất cả những người mang tài năng nhưng không được xã hội trân trọng. Cách Nguyễn Du đặt câu hỏi “ba trăm năm lẻ nữa” chính là một lời tự vấn, một nỗi cô đơn xuyên thời gian.</p>
          <div class="lesson-divider">* * *</div>
          <p><strong>Ghi chú học tập:</strong> Khi phân tích bài thơ này, cần chú ý đến nghệ thuật dùng điển cố, giọng điệu trầm tư và cảm hứng nhân đạo sâu sắc của Nguyễn Du. So sánh với các tác phẩm khác cùng thời kỳ để thấy rõ tiếng nói riêng của ông.</p>
        `
      },
      '2': {
        meta: 'Bài 2 — Thơ hiện đại Việt Nam',
        title: 'Tây Tiến — Quang Dũng',
        body: `
          <p>“Tây Tiến” là bài thơ nổi tiếng của Quang Dũng, sáng tác năm 1948, khi ông rời đơn vị Tây Tiến. Bài thơ là dòng hồi ức về những ngày tháng hành quân gian khó nhưng đầy hào hùng của người lính trên miền núi rừng Tây Bắc.</p>
          <blockquote>
            “Sông Mã xa rồi Tây Tiến ơi!<br>
            Nhớ về rừng núi, nhớ chơi vơi.”
            <cite>— Quang Dũng, Tây Tiến</cite>
          </blockquote>
          <p>Nét độc đáo của “Tây Tiến” nằm ở sự kết hợp giữa bút pháp hiện thực và lãng mạn. Thiên nhiên Tây Bắc hiện lên vừa hùng vĩ, dữ dội, vừa thơ mộng, huyền ảo. Hình ảnh người lính Tây Tiến được khắc họa với vẻ đẹp hào hoa, lãng mạn — khác biệt với hình tượng người lính trong nhiều bài thơ khác cùng thời kỳ.</p>
          <div class="lesson-divider">* * *</div>
          <p><strong>Ghi chú học tập:</strong> Phân tích hình ảnh thiên nhiên Tây Bắc qua ngôn ngữ giàu hình ảnh, nhạc tính của Quang Dũng. Chú ý đến cách ông sử dụng địa danh cụ thể để tạo cảm giác chân thật cho ký ức.</p>
        `
      },
      '3': {
        meta: 'Bài 3 — Truyện ngắn hiện đại',
        title: 'Chí Phèo — Nam Cao',
        body: `
          <p>“Chí Phèo” là truyện ngắn xuất sắc của Nam Cao, một trong những đỉnh cao của văn học hiện thực Việt Nam trước 1945. Tác phẩm kể về cuộc đời bi kịch của Chí Phèo — một người nông dân lương thiện bị xã hội đẩy vào con đường tha hóa, mất cả nhân hình lẫn nhân tính.</p>
          <blockquote>
            “Ai cho tao lương thiện?”
            <cite>— Chí Phèo, Nam Cao</cite>
          </blockquote>
          <p>Tiếng kêu “Ai cho tao lương thiện?” là một trong những câu văn ám ảnh nhất của văn học Việt Nam. Nó không chỉ là tiếng kêu của Chí Phèo, mà là tiếng kêu của tất cả những con người bị xã hội tước đoạt quyền sống và quyền làm người. Nam Cao đã viết nên một bản cáo trạng đầy dữ dội về xã hội phong kiến thực dân.</p>
          <div class="lesson-divider">* * *</div>
          <p><strong>Ghi chú học tập:</strong> Khi phân tích, cần làm rõ quá trình tha hóa và quá trình thức tỉnh của Chí Phèo. Chú ý vai trò của nhân vật Thị Nở trong việc đánh thức phần người trong Chí Phèo, và ý nghĩa của bát cháo hành.</p>
        `
      }
    };

    const params = new URLSearchParams(window.location.search);
    const lessonId = params.get('id');

    const metaElement = document.getElementById('lesson-meta');
    const titleElement = document.getElementById('lesson-title');
    const contentElement = document.getElementById('lesson-content');
    const notFoundElement = document.getElementById('lesson-not-found');

    if (lessonId && lessonDatabase[lessonId]) {
      const lesson = lessonDatabase[lessonId];
      metaElement.textContent = lesson.meta;
      titleElement.textContent = lesson.title;
      contentElement.innerHTML = lesson.body;
      document.title = `${lesson.title} — 11B4 Literaria`;
    } else {
      lessonDetailContainer.style.display = 'none';
      if (notFoundElement) {
        notFoundElement.style.display = 'block';
      }
      document.title = 'Không tìm thấy bài học — 11B4 Literaria';
    }
  }

  // --- Reading page: DOCX modal ---
  const readWorkCard = document.querySelector('[data-read-work]');
  const readModal = document.getElementById('read-modal');
  if (readWorkCard && readModal) {
    const readModalClose = document.getElementById('read-modal-close');
    const readMainContent = document.getElementById('read-modal-main-content');
    const readTitle = document.getElementById('read-modal-title');
    const readAuthor = document.getElementById('read-modal-author');
    const readNote = document.getElementById('read-modal-note');

    function closeReadModal() {
      readModal.classList.remove('active');
      document.body.style.overflow = '';
    }

    async function openReadModal() {
      const docxPath = readWorkCard.getAttribute('data-docx') || '';
      const workTitle = readWorkCard.getAttribute('data-title') || 'Không có tiêu đề';
      const workAuthor = readWorkCard.getAttribute('data-author') || 'Khuyết danh';
      const workNote = readWorkCard.getAttribute('data-note') || 'Không có ghi chú.';

      if (readTitle) readTitle.textContent = workTitle;
      if (readAuthor) readAuthor.textContent = workAuthor;
      if (readNote) readNote.textContent = workNote;

      if (readMainContent) {
        readMainContent.innerHTML = '<p class="read-loading">Đang tải nội dung tác phẩm...</p>';
      }

      readModal.classList.add('active');
      document.body.style.overflow = 'hidden';

      try {
        if (typeof mammoth === 'undefined') {
          throw new Error('Thiếu thư viện Mammoth');
        }

        const response = await fetch(encodeURI(docxPath));
        if (!response.ok) {
          throw new Error('Không thể tải file DOCX');
        }

        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });

        if (readMainContent) {
          readMainContent.innerHTML = result.value || '<p>Không có nội dung để hiển thị.</p>';
        }
      } catch (error) {
        if (readMainContent) {
          readMainContent.innerHTML = `<p class="read-loading">Không thể mở nội dung tự động. Bạn có thể tải file tại đây: <a href="${docxPath}" target="_blank" rel="noopener">Mở file DOCX</a>.</p>`;
        }
      }
    }

    readWorkCard.addEventListener('click', openReadModal);

    if (readModalClose) {
      readModalClose.addEventListener('click', closeReadModal);
    }

    readModal.addEventListener('click', function (event) {
      if (event.target === readModal) {
        closeReadModal();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && readModal.classList.contains('active')) {
        closeReadModal();
      }
    });
  }

  // --- Van-ban page: hardcoded PPTX modals ---
  const hardcodedPptxTriggers = document.querySelectorAll('[data-modal-target]');
  const hardcodedPptxModals = document.querySelectorAll('.read-modal-overlay[id^="pptx-modal-"]');

  if (hardcodedPptxTriggers.length > 0 && hardcodedPptxModals.length > 0) {
    function buildHardcodedPptxEmbedUrl(filePath) {
      try {
        const absoluteFileUrl = new URL(filePath, window.location.href).href;
        if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
          return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(absoluteFileUrl)}`;
        }
      } catch (error) {
        // fallback below
      }

      return encodeURI(filePath);
    }

    function openHardcodedModal(modalElement) {
      if (!modalElement) {
        return;
      }

      const modalFrame = modalElement.querySelector('iframe[data-pptx-url]');
      if (modalFrame) {
        const rawPath = modalFrame.getAttribute('data-pptx-url') || '';
        if (rawPath) {
          modalFrame.src = buildHardcodedPptxEmbedUrl(rawPath);
        }
      }

      modalElement.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeHardcodedModal(modalElement) {
      if (!modalElement) {
        return;
      }

      const modalFrame = modalElement.querySelector('iframe[data-pptx-url]');
      if (modalFrame) {
        modalFrame.src = 'about:blank';
      }

      modalElement.classList.remove('active');
      const hasActiveModal = document.querySelector('.read-modal-overlay.active');
      if (!hasActiveModal) {
        document.body.style.overflow = '';
      }
    }

    hardcodedPptxTriggers.forEach(function (trigger) {
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        const targetSelector = trigger.getAttribute('data-modal-target');
        if (!targetSelector) {
          return;
        }

        const targetModal = document.querySelector(targetSelector);
        openHardcodedModal(targetModal);
      });
    });

    hardcodedPptxModals.forEach(function (modalElement) {
      const closeButton = modalElement.querySelector('[data-close-modal]');
      if (closeButton) {
        closeButton.addEventListener('click', function () {
          closeHardcodedModal(modalElement);
        });
      }

      modalElement.addEventListener('click', function (event) {
        if (event.target === modalElement) {
          closeHardcodedModal(modalElement);
        }
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') {
        return;
      }

      const activeModal = document.querySelector('.read-modal-overlay[id^="pptx-modal-"].active');
      if (activeModal) {
        closeHardcodedModal(activeModal);
      }
    });
  }

  // --- Page transition effect ---
  document.body.classList.add('page-loaded');

});
