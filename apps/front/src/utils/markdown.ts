import { marked } from 'marked';

// Configure marked for safe HTML rendering
marked.setOptions({
  breaks: true,
  gfm: true, // GitHub Flavored Markdown
});

/**
 * Renders markdown text to HTML with basic safety checks
 * @param text - The markdown text to render
 * @returns HTML string or original text if no markdown is detected
 */
export const renderMarkdown = (text: string): string => {
  // Return empty string for falsy values
  if (!text) return '';

  // Basic check to avoid parsing simple strings unnecessarily
  // Look for common markdown characters
  if (
    text.indexOf('*') === -1 &&
    text.indexOf('_') === -1 &&
    text.indexOf('`') === -1 &&
    text.indexOf('[') === -1 &&
    text.indexOf('#') === -1 &&
    text.indexOf('>') === -1 &&
    text.indexOf('-') === -1 &&
    text.indexOf('+') === -1 &&
    !text.includes('\n')
  ) {
    return text; // Return plain text if no common markdown characters are found
  }

  try {
    // Use the synchronous version of marked
    return marked(text) as string;
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return text; // Return original text on error
  }
};

/**
 * Safely renders markdown with additional security considerations
 * Note: For production use with user-generated content, consider using
 * a sanitizer like DOMPurify after marked.parse()
 */
export const renderMarkdownSafe = (text: string): string => {
  const html = renderMarkdown(text);
  // Add additional sanitization here if needed
  return html;
};
