import { useTranslation } from 'react-i18next';

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  return (
    <div className="language-selector">
      <select
        id="lang-select"
        title="Language"
        value={i18n.language?.slice(0, 2) ?? 'fr'}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
      >
        <option value="fr">FR</option>
        <option value="en">EN</option>
        <option value="es">ES</option>
      </select>
    </div>
  );
}
