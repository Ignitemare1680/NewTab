// New Tab Page JavaScript
class NewTabPage {
    constructor() {
        this.searchEngines = {
            google: {
                name: 'Google',
                url: 'https://www.google.com/search?q='
            },
            bing: {
                name: 'Bing',
                url: 'https://www.bing.com/search?q='
            }
        };
        
        this.currentSearchEngine = 'google';
        this.bookmarks = [];
        this.currentTheme = 'light';
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.loadBookmarks();
        this.bindEvents();
        this.applyTheme();
        this.focusSearchInput();
        this.renderBookmarks();
    }
    
    // Search Functionality
    bindEvents() {
        // Search input events
        const searchInput = document.getElementById('searchInput');
        const searchEngineBtn = document.getElementById('searchEngineBtn');
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(searchInput.value.trim());
            }
        });
        
        searchEngineBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleSearchEngineDropdown();
        });
        
        // Settings modal events
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const closeSettingsBtn = document.getElementById('closeSettingsBtn');
        
        settingsBtn.addEventListener('click', () => this.openModal('settingsModal'));
        closeSettingsBtn.addEventListener('click', () => this.closeModal('settingsModal'));
        
        // Search engine radio buttons
        const searchEngineRadios = document.querySelectorAll('input[name="searchEngine"]');
        searchEngineRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.setSearchEngine(e.target.value);
            });
        });
        
        // Theme selection
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                this.setTheme(theme);
            });
        });
        
        // Add bookmark modal events
        const addBookmarkBtn = document.getElementById('addBookmarkBtn');
        const addBookmarkModal = document.getElementById('addBookmarkModal');
        const closeAddBookmarkBtn = document.getElementById('closeAddBookmarkBtn');
        const cancelAddBookmark = document.getElementById('cancelAddBookmark');
        const addBookmarkForm = document.getElementById('addBookmarkForm');
        
        addBookmarkBtn.addEventListener('click', () => this.openModal('addBookmarkModal'));
        closeAddBookmarkBtn.addEventListener('click', () => this.closeModal('addBookmarkModal'));
        cancelAddBookmark.addEventListener('click', () => this.closeModal('addBookmarkModal'));
        addBookmarkForm.addEventListener('submit', (e) => this.handleAddBookmark(e));
        
        // Edit bookmark modal events
        const editBookmarkModal = document.getElementById('editBookmarkModal');
        const closeEditBookmarkBtn = document.getElementById('closeEditBookmarkBtn');
        const cancelEditBookmark = document.getElementById('cancelEditBookmark');
        const editBookmarkForm = document.getElementById('editBookmarkForm');
        const deleteBookmark = document.getElementById('deleteBookmark');
        
        closeEditBookmarkBtn.addEventListener('click', () => this.closeModal('editBookmarkModal'));
        cancelEditBookmark.addEventListener('click', () => this.closeModal('editBookmarkModal'));
        editBookmarkForm.addEventListener('submit', (e) => this.handleEditBookmark(e));
        deleteBookmark.addEventListener('click', () => this.handleDeleteBookmark());
        
        // Modal overlay clicks
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal(overlay.id);
                }
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Focus search on '/' key
            if (e.key === '/' && !this.isModalOpen()) {
                e.preventDefault();
                searchInput.focus();
                searchInput.select();
            }
            
            // Close modals on Escape
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }
    
    performSearch(query) {
        if (!query) return;
        
        const engine = this.searchEngines[this.currentSearchEngine];
        const searchUrl = engine.url + encodeURIComponent(query);
        window.open(searchUrl, '_blank');
    }
    
    setSearchEngine(engine) {
        this.currentSearchEngine = engine;
        this.updateSearchEngineDisplay();
        this.saveSettings();
    }
    
    updateSearchEngineDisplay() {
        const searchEngineText = document.getElementById('searchEngineText');
        searchEngineText.textContent = this.searchEngines[this.currentSearchEngine].name;
        
        // Update radio button
        const radio = document.querySelector(`input[name="searchEngine"][value="${this.currentSearchEngine}"]`);
        if (radio) radio.checked = true;
    }
    
    toggleSearchEngineDropdown() {
        // For now, just open settings modal - could implement dropdown later
        this.openModal('settingsModal');
    }
    
    focusSearchInput() {
        const searchInput = document.getElementById('searchInput');
        searchInput.focus();
    }
    
    // Modal Management
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus first input in modal
        setTimeout(() => {
            const firstInput = modal.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 100);
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Clear form data
        const form = modal.querySelector('form');
        if (form) form.reset();
        
        // Focus search input
        setTimeout(() => this.focusSearchInput(), 100);
    }
    
    closeAllModals() {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
            this.closeModal(modal.id);
        });
    }
    
    isModalOpen() {
        return document.querySelector('.modal-overlay.active') !== null;
    }
    
    // Theme Management
    setTheme(theme) {
        this.currentTheme = theme;
        this.applyTheme();
        this.saveSettings();
    }
    
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        // Update theme option active state
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.theme === this.currentTheme) {
                option.classList.add('active');
            }
        });
    }
    
    // Bookmark Management
    handleAddBookmark(e) {
        e.preventDefault();
        
        const name = document.getElementById('bookmarkName').value.trim();
        const url = document.getElementById('bookmarkUrl').value.trim();
        
        if (!name || !url) return;
        
        // Ensure URL has protocol
        const finalUrl = url.startsWith('http') ? url : 'https://' + url;
        
        const bookmark = {
            id: Date.now().toString(),
            name,
            url: finalUrl,
            icon: this.getIconFromName(name)
        };
        
        this.bookmarks.push(bookmark);
        this.saveBookmarks();
        this.renderBookmarks();
        this.closeModal('addBookmarkModal');
    }
    
    handleEditBookmark(e) {
        e.preventDefault();
        
        const name = document.getElementById('editBookmarkName').value.trim();
        const url = document.getElementById('editBookmarkUrl').value.trim();
        
        if (!name || !url) return;
        
        const finalUrl = url.startsWith('http') ? url : 'https://' + url;
        
        const bookmark = this.bookmarks.find(b => b.id === this.editingBookmarkId);
        if (bookmark) {
            bookmark.name = name;
            bookmark.url = finalUrl;
            bookmark.icon = this.getIconFromName(name);
            
            this.saveBookmarks();
            this.renderBookmarks();
        }
        
        this.closeModal('editBookmarkModal');
    }
    
    handleDeleteBookmark() {
        this.bookmarks = this.bookmarks.filter(b => b.id !== this.editingBookmarkId);
        this.saveBookmarks();
        this.renderBookmarks();
        this.closeModal('editBookmarkModal');
    }
    
    editBookmark(id) {
        const bookmark = this.bookmarks.find(b => b.id === id);
        if (!bookmark) return;
        
        this.editingBookmarkId = id;
        
        document.getElementById('editBookmarkName').value = bookmark.name;
        document.getElementById('editBookmarkUrl').value = bookmark.url;
        
        this.openModal('editBookmarkModal');
    }
    
    getIconFromName(name) {
        return name.charAt(0).toUpperCase();
    }
    
    getFaviconUrl(url) {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        } catch (e) {
            return '';
        }
    }
    
    renderBookmarks() {
        const grid = document.getElementById('bookmarksGrid');
        
        if (this.bookmarks.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-muted);">
                    <p>No bookmarks yet. Click "Add Site" to get started!</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = this.bookmarks.map(bookmark => `
            <div class="bookmark-item" onclick="window.open('${bookmark.url}', '_blank')">
                <button class="bookmark-menu" onclick="event.stopPropagation(); newTabPage.editBookmark('${bookmark.id}')" aria-label="Edit bookmark">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                        <circle cx="5" cy="12" r="1"></circle>
                    </svg>
                </button>
                <div class="bookmark-icon">
                    <img src="${this.getFaviconUrl(bookmark.url)}" alt="${bookmark.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="bookmark-icon-fallback" style="display: none;">${bookmark.icon}</div>
                </div>
                <div class="bookmark-name">${bookmark.name}</div>
            </div>
        `).join('');
    }
    
    // Data Persistence
    saveSettings() {
        const settings = {
            searchEngine: this.currentSearchEngine,
            theme: this.currentTheme
        };
        localStorage.setItem('newTabSettings', JSON.stringify(settings));
    }
    
    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('newTabSettings') || '{}');
            this.currentSearchEngine = settings.searchEngine || 'google';
            this.currentTheme = settings.theme || 'light';
        } catch (e) {
            console.warn('Failed to load settings:', e);
        }
        
        this.updateSearchEngineDisplay();
    }
    
    saveBookmarks() {
        localStorage.setItem('newTabBookmarks', JSON.stringify(this.bookmarks));
    }
    
    loadBookmarks() {
        try {
            this.bookmarks = JSON.parse(localStorage.getItem('newTabBookmarks') || '[]');
        } catch (e) {
            console.warn('Failed to load bookmarks:', e);
            this.bookmarks = [];
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.newTabPage = new NewTabPage();
});

// Add some default bookmarks for demo purposes if none exist
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.newTabPage && window.newTabPage.bookmarks.length === 0) {
            const defaultBookmarks = [
                { id: '1', name: 'YouTube', url: 'https://youtube.com', icon: 'Y' },
                { id: '2', name: 'GitHub', url: 'https://github.com', icon: 'G' },
                { id: '3', name: 'Gmail', url: 'https://gmail.com', icon: 'G' },
                { id: '4', name: 'Twitter', url: 'https://twitter.com', icon: 'T' },
                { id: '5', name: 'Reddit', url: 'https://reddit.com', icon: 'R' },
                { id: '6', name: 'Netflix', url: 'https://netflix.com', icon: 'N' }
            ];
            
            window.newTabPage.bookmarks = defaultBookmarks;
            window.newTabPage.saveBookmarks();
            window.newTabPage.renderBookmarks();
        }
    }, 100);
});

