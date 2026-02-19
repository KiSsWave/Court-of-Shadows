/**
 * Échappe les caractères HTML dangereux.
 * En React, les chaînes rendues dans JSX sont échappées automatiquement.
 * Cette fonction est utile uniquement pour les cas de dangerouslySetInnerHTML.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
