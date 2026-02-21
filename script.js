/* ============================================
   11B4 LITERARIA - Shared JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

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

  if (galleryCards.length > 0 && modalOverlay) {
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
          mediaContainer.appendChild(video);
        } else {
          const img = document.createElement('img');
          img.src = src;
          img.alt = title;
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
      // Stop video if playing
      const video = modalOverlay.querySelector('video');
      if (video) video.pause();
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

  // --- Page transition effect ---
  document.body.classList.add('page-loaded');

});
