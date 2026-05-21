import DOMPurify from 'dompurify'

/**
 * Безопасный рендер HTML из Tiptap через DOMPurify.
 *
 * @param {string}  html        — сырой HTML из редактора
 * @param {string}  className   — CSS-класс обёртки
 * @param {Object}  style       — инлайн-стили
 * @param {string}  as          — тег обёртки (div / article / section)
 */
export default function SafeHtml({
                                     html = '',
                                     className = 'rich-html',
                                     style,
                                     as: Tag = 'div',
                                 }) {
    if (!html || html === '<p></p>') return null

    const clean = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 's', 'u',
            'h1', 'h2', 'h3', 'h4',
            'ul', 'ol', 'li',
            'blockquote', 'hr',
            'a',
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
        FORCE_BODY: true,
    })

    return (
        <Tag
            className={className}
            style={style}
            dangerouslySetInnerHTML={{ __html: clean }}
        />
    )
}