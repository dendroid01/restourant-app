import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'
import './RichTextEditor.css'

const TOOLBAR = [
    { cmd: 'toggleBold',        icon: 'fa-bold',         title: 'Жирный' },
    { cmd: 'toggleItalic',      icon: 'fa-italic',       title: 'Курсив' },
    { cmd: 'toggleStrike',      icon: 'fa-strikethrough', title: 'Зачёркнутый' },
    { cmd: 'toggleBulletList',  icon: 'fa-list-ul',      title: 'Список' },
    { cmd: 'toggleOrderedList', icon: 'fa-list-ol',      title: 'Нумерованный список' },
    { cmd: 'toggleBlockquote',  icon: 'fa-quote-left',   title: 'Цитата' },
]

const HEADINGS = [1, 2, 3]

export default function RichTextEditor({
                                           value = '',
                                           onChange,
                                           placeholder = 'Введите текст...',
                                           adminStyle = false,
                                           minHeight = 160,
                                       }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder }),
        ],
        content: value,
        onUpdate({ editor }) {
            onChange?.(editor.getHTML())
        },
    })

    // Синхронизация внешнего value (например, при открытии формы редактирования)
    useEffect(() => {
        if (!editor) return
        const current = editor.getHTML()
        if (value !== current) {
            editor.commands.setContent(value || '', false)
        }
    }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

    if (!editor) return null

    const inputClass = adminStyle ? 'admin-input' : 'form-control'

    return (
        <div className={`rte-wrapper ${inputClass}`} style={{ padding: 0, height: 'auto' }}>
            {/* Toolbar */}
            <div className="rte-toolbar">
                {HEADINGS.map(level => (
                    <button
                        key={level}
                        type="button"
                        title={`Заголовок ${level}`}
                        className={`rte-btn ${editor.isActive('heading', { level }) ? 'active' : ''}`}
                        onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
                    >
                        H{level}
                    </button>
                ))}
                <div className="rte-divider" />
                {TOOLBAR.map(({ cmd, icon, title }) => (
                    <button
                        key={cmd}
                        type="button"
                        title={title}
                        className={`rte-btn ${editor.isActive(cmd.replace('toggle', '').toLowerCase()) ? 'active' : ''}`}
                        onClick={() => editor.chain().focus()[cmd]().run()}
                    >
                        <i className={`fas ${icon}`} />
                    </button>
                ))}
                <div className="rte-divider" />
                <button
                    type="button"
                    title="Отменить"
                    className="rte-btn"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                >
                    <i className="fas fa-undo" />
                </button>
                <button
                    type="button"
                    title="Повторить"
                    className="rte-btn"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                >
                    <i className="fas fa-redo" />
                </button>
            </div>

            {/* Editor area */}
            <EditorContent
                editor={editor}
                className="rte-content"
                style={{ minHeight }}
            />
        </div>
    )
}