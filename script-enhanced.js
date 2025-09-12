class NewTabPage {
    constructor() {
        this.searchEngines = {
            google: {
                name: 'Google',
                url: 'https:
            },
            bing: {
                name: 'Bing',
                url: 'https:
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
            if (e.key === '/' && !this.isModalOpen() && !this.isRussianHubOpen()) {
                e.preventDefault();
                searchInput.focus();
                searchInput.value = '';
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
        if (this.isUrl(query)) {
            const finalUrl = query.startsWith('http') ? query : 'https:
            window.location.href = finalUrl;
        } else {
            const engine = this.searchEngines[this.settings.searchEngine];
            const searchUrl = engine.url + encodeURIComponent(query);
            window.location.href = searchUrl;
        }
    }
    isUrl(text) {
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        const domainPattern = /^[\w\.-]+\.[a-z]{2,}$/i;
        return urlPattern.test(text) || domainPattern.test(text);
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
    isRussianHubOpen() {
        return document.getElementById('russianHubOverlay').classList.contains('active');
    }
    handleAddBookmark(e) {
        e.preventDefault();
        const name = document.getElementById('bookmarkName').value.trim();
        const url = document.getElementById('bookmarkUrl').value.trim();
        if (!name || !url) return;
        const finalUrl = url.startsWith('http') ? url : 'https:
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
        const finalUrl = url.startsWith('http') ? url : 'https:
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
            return `https:
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
                { id: '1', name: 'YouTube', url: 'https:
                { id: '2', name: 'GitHub', url: 'https:
                { id: '3', name: 'Discord', url: 'https:
            ];
            window.newTabPage.bookmarks = defaultBookmarks;
            window.newTabPage.saveBookmarks();
            window.newTabPage.renderBookmarks();
        }
    }, 100);
});
class RussianLearningHub {
    constructor() {
        this.russianAlphabet = [
            { char: 'А', sound: 'ah', name: 'a', example: 'автобус (avtobus) - bus' },
            { char: 'Б', sound: 'beh', name: 'be', example: 'банан (banan) - banana' },
            { char: 'В', sound: 'veh', name: 've', example: 'вода (voda) - water' },
            { char: 'Г', sound: 'geh', name: 'ge', example: 'город (gorod) - city' },
            { char: 'Д', sound: 'deh', name: 'de', example: 'дом (dom) - house' },
            { char: 'Е', sound: 'yeh', name: 'ye', example: 'есть (yest) - to eat' },
            { char: 'Ё', sound: 'yo', name: 'yo', example: 'ёлка (yolka) - Christmas tree' },
            { char: 'Ж', sound: 'zheh', name: 'zhe', example: 'жизнь (zhizn) - life' },
            { char: 'З', sound: 'zeh', name: 'ze', example: 'зима (zima) - winter' },
            { char: 'И', sound: 'ee', name: 'i', example: 'игра (igra) - game' },
            { char: 'Й', sound: 'ee kratkoye', name: 'i kratkoye', example: 'мой (moy) - my' },
            { char: 'К', sound: 'kah', name: 'ka', example: 'кот (kot) - cat' },
            { char: 'Л', sound: 'el', name: 'el', example: 'лето (leto) - summer' },
            { char: 'М', sound: 'em', name: 'em', example: 'мама (mama) - mom' },
            { char: 'Н', sound: 'en', name: 'en', example: 'нос (nos) - nose' },
            { char: 'О', sound: 'oh', name: 'o', example: 'окно (okno) - window' },
            { char: 'П', sound: 'peh', name: 'pe', example: 'папа (papa) - dad' },
            { char: 'Р', sound: 'er', name: 'er', example: 'рука (ruka) - hand' },
            { char: 'С', sound: 'es', name: 'es', example: 'солнце (solntse) - sun' },
            { char: 'Т', sound: 'teh', name: 'te', example: 'тело (telo) - body' },
            { char: 'У', sound: 'oo', name: 'u', example: 'утро (utro) - morning' },
            { char: 'Ф', sound: 'ef', name: 'ef', example: 'фото (foto) - photo' },
            { char: 'Х', sound: 'khah', name: 'kha', example: 'хлеб (khleb) - bread' },
            { char: 'Ц', sound: 'tseh', name: 'tse', example: 'цвет (tsvet) - color' },
            { char: 'Ч', sound: 'cheh', name: 'che', example: 'час (chas) - hour' },
            { char: 'Ш', sound: 'shah', name: 'sha', example: 'школа (shkola) - school' },
            { char: 'Щ', sound: 'shchah', name: 'shcha', example: 'щека (shcheka) - cheek' },
            { char: 'Ъ', sound: 'tvyordiy znak', name: 'hard sign', example: 'объект (obyekt) - object' },
            { char: 'Ы', sound: 'ih', name: 'yery', example: 'мы (my) - we' },
            { char: 'Ь', sound: 'myagkiy znak', name: 'soft sign', example: 'день (den) - day' },
            { char: 'Э', sound: 'eh', name: 'e', example: 'это (eto) - this' },
            { char: 'Ю', sound: 'yu', name: 'yu', example: 'юг (yug) - south' },
            { char: 'Я', sound: 'ya', name: 'ya', example: 'яблоко (yabloko) - apple' }
        ];
        this.flashcards = [
            { russian: 'Привет', pronunciation: 'privet', translation: 'Hello', example: 'Привет, как дела? - Hello, how are you?' },
            { russian: 'Спасибо', pronunciation: 'spasibo', translation: 'Thank you', example: 'Спасибо за помощь - Thank you for help' },
            { russian: 'Пожалуйста', pronunciation: 'pozhaluysta', translation: 'Please/You\'re welcome', example: 'Пожалуйста, помогите - Please help' },
            { russian: 'Извините', pronunciation: 'izvinite', translation: 'Excuse me/Sorry', example: 'Извините, где метро? - Excuse me, where is the metro?' },
            { russian: 'Да', pronunciation: 'da', translation: 'Yes', example: 'Да, это правильно - Yes, that\'s correct' },
            { russian: 'Нет', pronunciation: 'net', translation: 'No', example: 'Нет, это неправильно - No, that\'s wrong' },
            { russian: 'Хорошо', pronunciation: 'khorosho', translation: 'Good/Well', example: 'Очень хорошо! - Very good!' },
            { russian: 'Плохо', pronunciation: 'plokho', translation: 'Bad', example: 'Это плохо - That\'s bad' },
            { russian: 'Вода', pronunciation: 'voda', translation: 'Water', example: 'Мне нужна вода - I need water' },
            { russian: 'Еда', pronunciation: 'yeda', translation: 'Food', example: 'Вкусная еда - Delicious food' },
            { russian: 'Дом', pronunciation: 'dom', translation: 'House', example: 'Мой дом большой - My house is big' },
            { russian: 'Работа', pronunciation: 'rabota', translation: 'Work', example: 'Я иду на работу - I\'m going to work' },
            { russian: 'Семья', pronunciation: 'semya', translation: 'Family', example: 'Моя семья - My family' },
            { russian: 'Друг', pronunciation: 'drug', translation: 'Friend', example: 'Мой лучший друг - My best friend' },
            { russian: 'Время', pronunciation: 'vremya', translation: 'Time', example: 'Сколько времени? - What time is it?' },
            { russian: 'Деньги', pronunciation: 'dengi', translation: 'Money', example: 'У меня нет денег - I don\'t have money' },
            { russian: 'Любовь', pronunciation: 'lyubov', translation: 'Love', example: 'Любовь к семье - Love for family' },
            { russian: 'Жизнь', pronunciation: 'zhizn', translation: 'Life', example: 'Жизнь прекрасна - Life is beautiful' },
            { russian: 'Мир', pronunciation: 'mir', translation: 'World/Peace', example: 'Мир во всём мире - Peace in the world' },
            { russian: 'Счастье', pronunciation: 'schastye', translation: 'Happiness', example: 'Большое счастье - Great happiness' }
        ];
        this.examples = [
            { russian: 'Как дела?', pronunciation: 'kak dela?', translation: 'How are you?' },
            { russian: 'Меня зовут...', pronunciation: 'menya zovut...', translation: 'My name is...' },
            { russian: 'Сколько это стоит?', pronunciation: 'skolko eto stoit?', translation: 'How much does this cost?' },
            { russian: 'Где туалет?', pronunciation: 'gde tualet?', translation: 'Where is the bathroom?' },
            { russian: 'Я не понимаю', pronunciation: 'ya ne ponimayu', translation: 'I don\'t understand' },
            { russian: 'Говорите медленнее', pronunciation: 'govorite medlennee', translation: 'Speak slower' },
            { russian: 'Помогите мне', pronunciation: 'pomogite mne', translation: 'Help me' },
            { russian: 'До свидания', pronunciation: 'do svidaniya', translation: 'Goodbye' }
        ];
        this.masteredItems = JSON.parse(localStorage.getItem('russianMastered') || '{}');
        this.currentFlashcardIndex = 0;
        this.isFlashcardFlipped = false;
        this.currentTab = 'alphabet';
        this.init();
    }
    init() {
        this.bindEvents();
        this.renderAlphabet();
        this.renderFlashcard();
        this.renderExamples();
        this.updateProgress();
    }
    bindEvents() {
        const russianHubBtn = document.getElementById('russianHubBtn');
        const russianHubOverlay = document.getElementById('russianHubOverlay');
        const closeRussianHubBtn = document.getElementById('closeRussianHubBtn');
        russianHubBtn.addEventListener('click', () => this.openHub());
        closeRussianHubBtn.addEventListener('click', () => this.closeHub());
        russianHubOverlay.addEventListener('click', (e) => {
            if (e.target === russianHubOverlay) {
                this.closeHub();
            }
        });
        const hubTabs = document.querySelectorAll('.hub-tab');
        hubTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        const flipFlashcard = document.getElementById('flipFlashcard');
        const prevFlashcard = document.getElementById('prevFlashcard');
        const nextFlashcard = document.getElementById('nextFlashcard');
        const masteredBtn = document.getElementById('masteredBtn');
        const needPracticeBtn = document.getElementById('needPracticeBtn');
        flipFlashcard.addEventListener('click', () => this.flipFlashcard());
        prevFlashcard.addEventListener('click', () => this.previousFlashcard());
        nextFlashcard.addEventListener('click', () => this.nextFlashcard());
        masteredBtn.addEventListener('click', () => this.markAsMastered('flashcard'));
        needPracticeBtn.addEventListener('click', () => this.markAsNeedsPractice('flashcard'));
        document.addEventListener('keydown', (e) => {
            if (this.isHubOpen()) {
                if (e.key === 'ArrowLeft') this.previousFlashcard();
                if (e.key === 'ArrowRight') this.nextFlashcard();
                if (e.key === ' ') {
                    e.preventDefault();
                    this.flipFlashcard();
                }
            }
        });
    }
    openHub() {
        document.getElementById('russianHubOverlay').classList.add('active');
    }
    closeHub() {
        document.getElementById('russianHubOverlay').classList.remove('active');
    }
    isHubOpen() {
        return document.getElementById('russianHubOverlay').classList.contains('active');
    }
    switchTab(tabName) {
        this.currentTab = tabName;
        document.querySelectorAll('.hub-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.hub-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }
    renderAlphabet() {
        const alphabetGrid = document.getElementById('alphabetGrid');
        alphabetGrid.innerHTML = this.russianAlphabet.map((letter, index) => {
            const isMastered = this.masteredItems[`alphabet-${index}`];
            return `
                <div class="alphabet-letter ${isMastered ? 'mastered' : ''}" onclick="russianHub.playLetterSound('${letter.sound}'); russianHub.showLetterDetails(${index})">
                    <div class="letter-char">${letter.char}</div>
                    <div class="letter-sound">[${letter.sound}]</div>
                    <div class="letter-name">${letter.name}</div>
                    <button class="mastery-btn" onclick="event.stopPropagation(); russianHub.toggleLetterMastery(${index})" style="margin-top: 8px; padding: 4px 8px; border: none; border-radius: 4px; background: ${isMastered ? '#28a745' : 'var(--accent-primary)'}; color: white; font-size: 10px; cursor: pointer;">
                        ${isMastered ? '✓ Mastered' : 'Master'}
                    </button>
                </div>
            `;
        }).join('');
    }
    renderFlashcard() {
        const flashcard = this.flashcards[this.currentFlashcardIndex];
        const isMastered = this.masteredItems[`flashcard-${this.currentFlashcardIndex}`];
        document.getElementById('flashcardWord').textContent = flashcard.russian;
        document.getElementById('flashcardPronunciation').textContent = `[${flashcard.pronunciation}]`;
        document.getElementById('flashcardTranslation').textContent = flashcard.translation;
        document.getElementById('flashcardExample').textContent = flashcard.example;
        const masteredBtn = document.getElementById('masteredBtn');
        masteredBtn.style.background = isMastered ? '#28a745' : '#ffc107';
        masteredBtn.textContent = isMastered ? '✓ Mastered!' : 'I\'ve mastered this!';
    }
    renderExamples() {
        const examplesList = document.getElementById('examplesList');
        examplesList.innerHTML = this.examples.map((example, index) => {
            const isMastered = this.masteredItems[`example-${index}`];
            return `
                <div class="example-item ${isMastered ? 'mastered' : ''}">
                    <div class="example-russian">${example.russian}</div>
                    <div class="example-pronunciation">[${example.pronunciation}]</div>
                    <div class="example-translation">${example.translation}</div>
                    <button class="mastery-btn" onclick="russianHub.toggleExampleMastery(${index})" style="margin-top: 12px; padding: 8px 16px; border: none; border-radius: 6px; background: ${isMastered ? '#28a745' : 'var(--accent-primary)'}; color: white; font-size: 12px; cursor: pointer;">
                        ${isMastered ? '✓ Mastered' : 'Mark as Mastered'}
                    </button>
                </div>
            `;
        }).join('');
    }
    flipFlashcard() {
        const flashcard = document.getElementById('currentFlashcard');
        flashcard.classList.toggle('flipped');
        this.isFlashcardFlipped = !this.isFlashcardFlipped;
    }
    previousFlashcard() {
        this.currentFlashcardIndex = (this.currentFlashcardIndex - 1 + this.flashcards.length) % this.flashcards.length;
        this.resetFlashcard();
        this.renderFlashcard();
    }
    nextFlashcard() {
        this.currentFlashcardIndex = (this.currentFlashcardIndex + 1) % this.flashcards.length;
        this.resetFlashcard();
        this.renderFlashcard();
    }
    resetFlashcard() {
        const flashcard = document.getElementById('currentFlashcard');
        flashcard.classList.remove('flipped');
        this.isFlashcardFlipped = false;
    }
    markAsMastered(type) {
        const key = `${type}-${this.currentFlashcardIndex}`;
        this.masteredItems[key] = true;
        this.saveMasteredItems();
        this.renderFlashcard();
        this.updateProgress();
    }
    markAsNeedsPractice(type) {
        const key = `${type}-${this.currentFlashcardIndex}`;
        delete this.masteredItems[key];
        this.saveMasteredItems();
        this.renderFlashcard();
        this.updateProgress();
    }
    toggleLetterMastery(index) {
        const key = `alphabet-${index}`;
        if (this.masteredItems[key]) {
            delete this.masteredItems[key];
        } else {
            this.masteredItems[key] = true;
        }
        this.saveMasteredItems();
        this.renderAlphabet();
        this.updateProgress();
    }
    toggleExampleMastery(index) {
        const key = `example-${index}`;
        if (this.masteredItems[key]) {
            delete this.masteredItems[key];
        } else {
            this.masteredItems[key] = true;
        }
        this.saveMasteredItems();
        this.renderExamples();
        this.updateProgress();
    }
    updateProgress() {
        const totalItems = this.russianAlphabet.length + this.flashcards.length + this.examples.length;
        const masteredCount = Object.keys(this.masteredItems).length;
        const progressPercentage = (masteredCount / totalItems) * 100;
        document.getElementById('masteredCount').textContent = masteredCount;
        document.getElementById('totalCount').textContent = totalItems;
        document.getElementById('progressFill').style.width = `${progressPercentage}%`;
    }
    playLetterSound(sound) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(sound);
            utterance.lang = 'ru-RU';
            utterance.rate = 0.7;
            speechSynthesis.speak(utterance);
        }
    }
    showLetterDetails(index) {
        const letter = this.russianAlphabet[index];
        alert(`${letter.char} (${letter.name})\nSound: [${letter.sound}]\nExample: ${letter.example}`);
    }
    saveMasteredItems() {
        localStorage.setItem('russianMastered', JSON.stringify(this.masteredItems));
    }
}
document.addEventListener('DOMContentLoaded', () => {
    window.russianHub = new RussianLearningHub();
});
