document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        updateIcon(savedTheme);
    }
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            let currentTheme = htmlElement.getAttribute('data-theme');
            let newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateIcon(newTheme);
        });
    }
    
    function updateIcon(theme) {
        if (!themeToggleBtn) return;

        if (theme === 'dark') {
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
            themeToggleBtn.setAttribute('aria-label', 'Ganti ke Tema Terang');
        } else {
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
            themeToggleBtn.setAttribute('aria-label', 'Ganti ke Tema Gelap');
        }
    }
    
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    const searchInput = document.getElementById('search-articles');
    const articleCards = document.querySelectorAll('.grid-artikel .kartu');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const validCategories = ['semua', 'genre', 'album', 'instrumen'];
    let selectedCategory = 'semua';

    const categoryFromUrl = new URLSearchParams(window.location.search).get('category');
    if (categoryFromUrl && validCategories.includes(categoryFromUrl)) {
        selectedCategory = categoryFromUrl;
    }

    function filterArticles() {
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

        articleCards.forEach((card) => {
            const searchableText = card.textContent.toLowerCase();
            const matchesSearch = query === '' || searchableText.includes(query);
            const matchesCategory = selectedCategory === 'semua' || card.dataset.category === selectedCategory;
            card.classList.toggle('is-hidden', !matchesSearch || !matchesCategory);
        });
    }

    function updateCategoryUrl() {
        const params = new URLSearchParams(window.location.search);

        if (selectedCategory === 'semua') {
            params.delete('category');
        } else {
            params.set('category', selectedCategory);
        }

        const newQuery = params.toString();
        const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ''}`;
        history.replaceState({}, '', newUrl);
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterArticles);
    }

    if (filterButtons.length) {
        filterButtons.forEach((button) => {
            const isActive = button.dataset.category === selectedCategory;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', String(isActive));

            button.addEventListener('click', () => {
                selectedCategory = button.dataset.category;
                filterButtons.forEach((filterButton) => {
                    const isSelected = filterButton === button;
                    filterButton.classList.toggle('active', isSelected);
                    filterButton.setAttribute('aria-pressed', String(isSelected));
                });
                updateCategoryUrl();
                filterArticles();
            });
        });

        filterArticles();
    }

    const articleContent = document.querySelector('.konten-artikel');
    if (articleContent) {
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        progressBar.setAttribute('role', 'progressbar');
        progressBar.setAttribute('aria-label', 'Kemajuan membaca artikel');
        progressBar.setAttribute('aria-valuemin', '0');
        progressBar.setAttribute('aria-valuemax', '100');
        document.body.appendChild(progressBar);

        const updateReadingProgress = () => {
            const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = scrollableHeight > 0
                ? Math.min(100, Math.max(0, (window.scrollY / scrollableHeight) * 100))
                : 0;
            progressBar.style.width = `${progress}%`;
            progressBar.setAttribute('aria-valuenow', Math.round(progress));
        };

        window.addEventListener('scroll', updateReadingProgress, { passive: true });
        updateReadingProgress();
    }

    const commentForm = document.querySelector('.form-komentar');
    const commentList = document.querySelector('.daftar-komentar');
    const commentHeading = document.querySelector('.komentar-section h3');

    if (commentForm && commentList) {
        const articleKey = `comments-${window.location.pathname.split('/').pop() || 'artikel'}`;
        let comments = JSON.parse(localStorage.getItem(articleKey) || '[]');
        const commentText = commentForm.querySelector('textarea');
        const commentName = commentForm.querySelector('input[type="text"]');

        const renderComments = () => {
            commentList.replaceChildren();
            if (commentHeading) commentHeading.textContent = `Komentar (${comments.length})`;

            if (comments.length === 0) {
                const emptyMessage = document.createElement('p');
                emptyMessage.className = 'komentar-kosong';
                emptyMessage.textContent = 'Belum ada komentar.';
                commentList.appendChild(emptyMessage);
                return;
            }

            comments.forEach((comment, index) => {
                const item = document.createElement('article');
                item.className = 'komentar-item';

                const author = document.createElement('strong');
                author.textContent = comment.name;
                const date = document.createElement('time');
                date.dateTime = comment.date;
                date.textContent = new Date(comment.date).toLocaleString('id-ID');
                const message = document.createElement('p');
                message.textContent = comment.text;
                const deleteButton = document.createElement('button');
                deleteButton.className = 'hapus-komentar';
                deleteButton.type = 'button';
                deleteButton.title = 'Hapus komentar';
                deleteButton.setAttribute('aria-label', `Hapus komentar dari ${comment.name}`);
                deleteButton.innerHTML = '<i class="fas fa-trash" aria-hidden="true"></i>';
                deleteButton.addEventListener('click', () => {
                    comments.splice(index, 1);
                    localStorage.setItem(articleKey, JSON.stringify(comments));
                    renderComments();
                });

                item.append(author, date, message, deleteButton);
                commentList.appendChild(item);
            });
        };

        commentForm.addEventListener('submit', (event) => {
            event.preventDefault();
            comments.push({
                name: commentName.value.trim(),
                text: commentText.value.trim(),
                date: new Date().toISOString()
            });
            localStorage.setItem(articleKey, JSON.stringify(comments));
            commentForm.reset();
            renderComments();
        });

        renderComments();
    }
});
