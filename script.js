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
        
        this.settings = {
            searchEngine: 'google',
            theme: 'light',
            backgroundType: 'theme',
            customBackground: null,
            backgroundColor: '#ffffff',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundOpacity: 100,
            gridColumns: 6,
            borderRadius: 8,
            animationSpeed: '0.3s',
            fontFamily: 'Inter',
            fontSize: 16
        };
        
        this.bookmarks = [];
        this.editingBookmarkId = null;
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.loadBookmarks();
        this.bindEvents();
        this.applyAllSettings();
        this.focusSearchInput();
        this.renderBookmarks();
    }
    
    bindEvents() {
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

        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const closeSettingsBtn = document.getElementById('closeSettingsBtn');
        
        settingsBtn.addEventListener('click', () => this.openModal('settingsModal'));
        closeSettingsBtn.addEventListener('click', () => this.closeModal('settingsModal'));
     
        const searchEngineRadios = document.querySelectorAll('input[name="searchEngine"]');
        searchEngineRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.setSetting('searchEngine', e.target.value);
            });
        });

        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                this.setSetting('theme', theme);
            });
        });

        const backgroundTypeRadios = document.querySelectorAll('input[name="backgroundType"]');
        backgroundTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.setSetting('backgroundType', e.target.value);
                this.toggleBackgroundControls(e.target.value);
            });
        });

        const backgroundFile = document.getElementById('backgroundFile');
        backgroundFile.addEventListener('change', (e) => {
            this.handleBackgroundUpload(e);
        });
        
        const backgroundColor = document.getElementById('backgroundColor');
        backgroundColor.addEventListener('change', (e) => {
            this.setSetting('backgroundColor', e.target.value);
        });
        
        const backgroundSize = document.getElementById('backgroundSize');
        const backgroundPosition = document.getElementById('backgroundPosition');
        const backgroundOpacity = document.getElementById('backgroundOpacity');
        
        backgroundSize.addEventListener('change', (e) => {
            this.setSetting('backgroundSize', e.target.value);
        });
        
        backgroundPosition.addEventListener('change', (e) => {
            this.setSetting('backgroundPosition', e.target.value);
        });
        
        backgroundOpacity.addEventListener('input', (e) => {
            this.setSetting('backgroundOpacity', parseInt(e.target.value));
            document.getElementById('opacityValue').textContent = e.target.value + '%';
        });
        
        const gridColumns = document.getElementById('gridColumns');
        const borderRadius = document.getElementById('borderRadius');
        const animationSpeed = document.getElementById('animationSpeed');
        
        gridColumns.addEventListener('input', (e) => {
            this.setSetting('gridColumns', parseInt(e.target.value));
            document.getElementById('columnsValue').textContent = e.target.value;
        });
        
        borderRadius.addEventListener('input', (e) => {
            this.setSetting('borderRadius', parseInt(e.target.value));
            document.getElementById('radiusValue').textContent = e.target.value + 'px';
        });
        
        animationSpeed.addEventListener('change', (e) => {
            this.setSetting('animationSpeed', e.target.value);
        });
        
        const fontFamily = document.getElementById('fontFamily');
        const fontSize = document.getElementById('fontSize');
        
        fontFamily.addEventListener('change', (e) => {
            this.setSetting('fontFamily', e.target.value);
        });
        
        fontSize.addEventListener('input', (e) => {
            this.setSetting('fontSize', parseInt(e.target.value));
            document.getElementById('fontSizeValue').textContent = e.target.value + 'px';
        });
        
        const exportSettings = document.getElementById('exportSettings');
        const importSettingsBtn = document.getElementById('importSettingsBtn');
        const importSettings = document.getElementById('importSettings');
        const resetSettings = document.getElementById('resetSettings');
        
        exportSettings.addEventListener('click', () => this.exportSettings());
        importSettingsBtn.addEventListener('click', () => importSettings.click());
        importSettings.addEventListener('change', (e) => this.importSettings(e));
        resetSettings.addEventListener('click', () => this.resetSettings());
        
        const addBookmarkBtn = document.getElementById('addBookmarkBtn');
        const addBookmarkModal = document.getElementById('addBookmarkModal');
        const closeAddBookmarkBtn = document.getElementById('closeAddBookmarkBtn');
        const cancelAddBookmark = document.getElementById('cancelAddBookmark');
        const addBookmarkForm = document.getElementById('addBookmarkForm');
        
        addBookmarkBtn.addEventListener('click', () => this.openModal('addBookmarkModal'));
        closeAddBookmarkBtn.addEventListener('click', () => this.closeModal('addBookmarkModal'));
        cancelAddBookmark.addEventListener('click', () => this.closeModal('addBookmarkModal'));
        addBookmarkForm.addEventListener('submit', (e) => this.handleAddBookmark(e));
        
        const editBookmarkModal = document.getElementById('editBookmarkModal');
        const closeEditBookmarkBtn = document.getElementById('closeEditBookmarkBtn');
        const cancelEditBookmark = document.getElementById('cancelEditBookmark');
        const editBookmarkForm = document.getElementById('editBookmarkForm');
        const deleteBookmark = document.getElementById('deleteBookmark');
        
        closeEditBookmarkBtn.addEventListener('click', () => this.closeModal('editBookmarkModal'));
        cancelEditBookmark.addEventListener('click', () => this.closeModal('editBookmarkModal'));
        editBookmarkForm.addEventListener('submit', (e) => this.handleEditBookmark(e));
        deleteBookmark.addEventListener('click', () => this.handleDeleteBookmark());
        
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal(overlay.id);
                }
            });
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && !this.isModalOpen()) {
                e.preventDefault();
                searchInput.focus();
                searchInput.select();
            }
            
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }
    
    setSetting(key, value) {
        this.settings[key] = value;
        this.applyAllSettings();
        this.saveSettings();
    }
    
    applyAllSettings() {
        this.applyTheme();
        this.applyBackground();
        this.applyLayout();
        this.applyTypography();
        this.updateSettingsUI();
    }
    
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.theme === this.settings.theme) {
                option.classList.add('active');
            }
        });
    }
    
    applyBackground() {
        const body = document.body;
        
        const existingOverlay = document.querySelector('.custom-background-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        if (this.settings.backgroundType === 'custom' && this.settings.customBackground) {
            const overlay = document.createElement('div');
            overlay.className = 'custom-background-overlay';
            overlay.style.backgroundImage = `url(${this.settings.customBackground})`;
            overlay.style.backgroundSize = this.settings.backgroundSize;
            overlay.style.backgroundPosition = this.settings.backgroundPosition;
            overlay.style.opacity = this.settings.backgroundOpacity / 100;
            body.appendChild(overlay);
        } else if (this.settings.backgroundType === 'color') {
            const overlay = document.createElement('div');
            overlay.className = 'custom-background-overlay';
            overlay.style.backgroundColor = this.settings.backgroundColor;
            overlay.style.opacity = this.settings.backgroundOpacity / 100;
            body.appendChild(overlay);
        }
    }
    
    applyLayout() {
        const bookmarksGrid = document.getElementById('bookmarksGrid');
        const root = document.documentElement;
        
        bookmarksGrid.className = `bookmarks-grid grid-${this.settings.gridColumns}`;
        
        root.style.setProperty('--dynamic-border-radius', `${this.settings.borderRadius}px`);
        document.querySelectorAll('.bookmark-item, .modal, .search-wrapper, .theme-option').forEach(el => {
            el.classList.add('dynamic-radius');
        });
        
        root.style.setProperty('--dynamic-animation-speed', this.settings.animationSpeed);
        document.body.classList.add('dynamic-animation');
    }
    
    applyTypography() {
        const root = document.documentElement;
        
        root.style.setProperty('--dynamic-font-family', this.settings.fontFamily);
        document.body.classList.add('dynamic-font');
        
        root.style.setProperty('--dynamic-font-size', `${this.settings.fontSize}px`);
        document.querySelectorAll('.bookmark-name, .setting-label, .form-group label').forEach(el => {
            el.classList.add('dynamic-font-size');
        });
    }
    
    updateSettingsUI() {
        const searchEngineText = document.getElementById('searchEngineText');
        searchEngineText.textContent = this.searchEngines[this.settings.searchEngine].name;
        
        const searchEngineRadio = document.querySelector(`input[name="searchEngine"][value="${this.settings.searchEngine}"]`);
        if (searchEngineRadio) searchEngineRadio.checked = true;
        
        const backgroundTypeRadio = document.querySelector(`input[name="backgroundType"][value="${this.settings.backgroundType}"]`);
        if (backgroundTypeRadio) backgroundTypeRadio.checked = true;
        
        document.getElementById('backgroundColor').value = this.settings.backgroundColor;
        document.getElementById('backgroundSize').value = this.settings.backgroundSize;
        document.getElementById('backgroundPosition').value = this.settings.backgroundPosition;
        document.getElementById('backgroundOpacity').value = this.settings.backgroundOpacity;
        document.getElementById('opacityValue').textContent = this.settings.backgroundOpacity + '%';
        
        document.getElementById('gridColumns').value = this.settings.gridColumns;
        document.getElementById('columnsValue').textContent = this.settings.gridColumns;
        document.getElementById('borderRadius').value = this.settings.borderRadius;
        document.getElementById('radiusValue').textContent = this.settings.borderRadius + 'px';
        document.getElementById('animationSpeed').value = this.settings.animationSpeed;
        
        document.getElementById('fontFamily').value = this.settings.fontFamily;
        document.getElementById('fontSize').value = this.settings.fontSize;
        document.getElementById('fontSizeValue').textContent = this.settings.fontSize + 'px';
        
        this.toggleBackgroundControls(this.settings.backgroundType);
    }
    
    toggleBackgroundControls(type) {
        const uploadDiv = document.getElementById('backgroundUpload');
        const colorDiv = document.getElementById('backgroundColorPicker');
        const controlsDiv = document.getElementById('backgroundControls');
        
        uploadDiv.style.display = type === 'custom' ? 'block' : 'none';
        colorDiv.style.display = type === 'color' ? 'flex' : 'none';
        controlsDiv.style.display = (type === 'custom' || type === 'color') ? 'block' : 'none';
    }
    
    handleBackgroundUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            this.setSetting('customBackground', event.target.result);
            this.setSetting('backgroundType', 'custom');
        };
        reader.readAsDataURL(file);
    }
    
    exportSettings() {
        const data = {
            settings: this.settings,
            bookmarks: this.bookmarks,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `new-tab-settings-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    importSettings(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (data.settings) {
                    this.settings = { ...this.settings, ...data.settings };
                }
                
                if (data.bookmarks) {
                    this.bookmarks = data.bookmarks;
                }
                
                this.saveSettings();
                this.saveBookmarks();
                this.applyAllSettings();
                this.renderBookmarks();
                
                alert('Settings imported successfully!');
            } catch (error) {
                alert('Error importing settings: Invalid file format');
            }
        };
        reader.readAsText(file);
        
        e.target.value = '';
    }
    
    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
            this.settings = {
                searchEngine: 'google',
                theme: 'light',
                backgroundType: 'theme',
                customBackground: null,
                backgroundColor: '#ffffff',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundOpacity: 100,
                gridColumns: 6,
                borderRadius: 8,
                animationSpeed: '0.3s',
                fontFamily: 'Inter',
                fontSize: 16
            };
            
            this.saveSettings();
            this.applyAllSettings();
            alert('Settings reset to defaults!');
        }
    }
    
    performSearch(query) {
        if (!query) return;
        
        const engine = this.searchEngines[this.settings.searchEngine];
        const searchUrl = engine.url + encodeURIComponent(query);
        window.location.href = searchUrl; // Changed to replace current tab
    }
    
    toggleSearchEngineDropdown() {
        this.openModal('settingsModal');
    }
    
    focusSearchInput() {
        const searchInput = document.getElementById('searchInput');
        searchInput.focus();
    }
    
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            const firstInput = modal.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 100);
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        const form = modal.querySelector('form');
        if (form) form.reset();
        
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
    
    handleAddBookmark(e) {
        e.preventDefault();
        
        const name = document.getElementById('bookmarkName').value.trim();
        const url = document.getElementById('bookmarkUrl').value.trim();
        
        if (!name || !url) return;
        
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
            <div class="bookmark-item dynamic-radius" onclick="window.location.href='${bookmark.url}'">
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
                <div class="bookmark-name dynamic-font-size">${bookmark.name}</div>
            </div>
        `).join('');
    }
    
    saveSettings() {
        localStorage.setItem('newTabSettings', JSON.stringify(this.settings));
    }
    
    loadSettings() {
        try {
            const savedSettings = JSON.parse(localStorage.getItem('newTabSettings') || '{}');
            this.settings = { ...this.settings, ...savedSettings };
        } catch (e) {
            console.warn('Failed to load settings:', e);
        }
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

document.addEventListener('DOMContentLoaded', () => {
    window.newTabPage = new NewTabPage();
});

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.newTabPage && window.newTabPage.bookmarks.length === 0) {
            const defaultBookmarks = [
                { id: '1', name: 'YouTube', url: 'https://youtube.com', icon: 'Y' },
                { id: '2', name: 'GitHub', url: 'https://github.com', icon: 'G' },
                { id: '3', name: 'Discord', url: 'https://discord.com/channels/@me', icon: 'D' },
            ];
            
            window.newTabPage.bookmarks = defaultBookmarks;
            window.newTabPage.saveBookmarks();
            window.newTabPage.renderBookmarks();
        }
    }, 100);
});
