// Gestionnaire d'internationalisation (i18n) pour Court of Shadows

class I18n {
    constructor() {
        this.translations = {};
        this.currentLang = localStorage.getItem('lang') ||
                          navigator.language.split('-')[0] || 'fr';
        this.supportedLangs = ['fr', 'en', 'es'];
        if (!this.supportedLangs.includes(this.currentLang)) {
            this.currentLang = 'fr';
        }
        this.isLoaded = false;
    }

    async init() {
        await this.loadLanguage(this.currentLang);
        this.translatePage();
        this.setupLanguageSelector();
        this.isLoaded = true;
    }

    async loadLanguage(lang) {
        try {
            const response = await fetch(`/locales/${lang}.json`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            this.translations = await response.json();
            this.currentLang = lang;
            localStorage.setItem('lang', lang);
            document.documentElement.lang = lang;
        } catch (error) {
            console.error(`Erreur chargement langue ${lang}:`, error);
            // Fallback vers français si erreur
            if (lang !== 'fr') {
                await this.loadLanguage('fr');
            }
        }
    }

    /**
     * Traduit une clé avec interpolation optionnelle
     * @param {string} key - Clé de traduction (ex: "common.yes" ou "waiting.playerJoined")
     * @param {object} params - Paramètres d'interpolation (ex: { player: "Jean" })
     * @returns {string} - Texte traduit
     */
    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.translations;

        for (const k of keys) {
            value = value?.[k];
        }

        if (!value) {
            console.warn(`Traduction manquante: ${key}`);
            return key;
        }

        // Interpolation des paramètres {param}
        return value.replace(/\{(\w+)\}/g, (_, name) => params[name] ?? `{${name}}`);
    }

    /**
     * Traduit tous les éléments avec data-i18n et data-i18n-placeholder
     */
    translatePage() {
        // Texte contenu
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translated = this.t(key);
            if (translated !== key) {
                el.textContent = translated;
            }
        });

        // Placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translated = this.t(key);
            if (translated !== key) {
                el.placeholder = translated;
            }
        });

        // Titles (tooltips)
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const translated = this.t(key);
            if (translated !== key) {
                el.title = translated;
            }
        });
    }

    /**
     * Configure le sélecteur de langue
     */
    setupLanguageSelector() {
        const selector = document.getElementById('lang-select');
        if (selector) {
            selector.value = this.currentLang;
            selector.addEventListener('change', async (e) => {
                await this.setLanguage(e.target.value);
            });
        }
    }

    /**
     * Change la langue et recharge les traductions
     * @param {string} lang - Code langue (fr, en, es)
     */
    async setLanguage(lang) {
        if (!this.supportedLangs.includes(lang)) {
            console.warn(`Langue non supportée: ${lang}`);
            return;
        }

        await this.loadLanguage(lang);
        this.translatePage();

        // Mettre à jour le sélecteur si présent
        const selector = document.getElementById('lang-select');
        if (selector) {
            selector.value = lang;
        }

        // Émettre un événement pour notifier les autres composants
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
    }

    /**
     * Retourne la langue courante
     * @returns {string}
     */
    getCurrentLanguage() {
        return this.currentLang;
    }

    /**
     * Retourne les langues supportées
     * @returns {string[]}
     */
    getSupportedLanguages() {
        return [...this.supportedLangs];
    }
}

// Instance globale
const i18n = new I18n();

// Fonction globale raccourcie pour la traduction
window.t = (key, params) => i18n.t(key, params);

// Exporter pour utilisation en module si nécessaire
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { I18n, i18n };
}
