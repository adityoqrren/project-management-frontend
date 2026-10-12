import { useEditorState, type Editor } from "@tiptap/react";

interface RichTextToolbarProps {
  editor: Editor;
}

export default function RichTextToolbar({
  editor,
}: RichTextToolbarProps) {
  const { active } = useEditorState({
    editor,
    selector: ({ editor }) => ({
      active: {
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        underline: editor.isActive("underline"),
        h1: editor.isActive("heading", { level: 1 }),
        h2: editor.isActive("heading", { level: 2 }),
        h3: editor.isActive("heading", { level: 3 }),
        bulletList: editor.isActive("bulletList"),
        orderedList: editor.isActive("orderedList"),
        blockquote: editor.isActive("blockquote"),
      },
    }),
  });

  const activeClass = "bg-gray-200 text-gray-900";

  return (
    <div className="flex flex-wrap items-center gap-1 border-b p-2">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`rounded px-2 py-1 text-sm font-bold hover:bg-gray-100 disabled:opacity-40 ${
          active.bold ? activeClass : ""
        }`}
      >
        B
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`rounded px-2 py-1 text-sm italic hover:bg-gray-100 disabled:opacity-40 ${
          active.italic ? activeClass : ""
        }`}
      >
        I
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={`rounded px-2 py-1 text-sm underline hover:bg-gray-100 disabled:opacity-40 ${
          active.underline ? activeClass : ""
        }`}
      >
        U
      </button>

      <div className="mx-1 h-5 w-px bg-gray-200" />

      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
        className={`rounded px-2 py-1 text-sm font-semibold hover:bg-gray-100 ${
          active.h1 ? activeClass : ""
        }`}
      >
        H1
      </button>

      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        className={`rounded px-2 py-1 text-sm font-semibold hover:bg-gray-100 ${
          active.h2 ? activeClass : ""
        }`}
      >
        H2
      </button>

      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        className={`rounded px-2 py-1 text-sm font-semibold hover:bg-gray-100 ${
          active.h3 ? activeClass : ""
        }`}
      >
        H3
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`rounded px-2 py-1 text-sm hover:bg-gray-100 ${
          active.bulletList ? activeClass : ""
        }`}
      >
        • List
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`rounded px-2 py-1 text-sm hover:bg-gray-100 ${
          active.orderedList ? activeClass : ""
        }`}
      >
        1. List
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`rounded px-2 py-1 text-sm hover:bg-gray-100 ${
          active.blockquote ? activeClass : ""
        }`}
      >
        Quote
      </button>

      <div className="mx-1 h-5 w-px bg-gray-200" />

      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="rounded px-2 py-1 text-sm hover:bg-gray-100 disabled:opacity-40"
      >
        Undo
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="rounded px-2 py-1 text-sm hover:bg-gray-100 disabled:opacity-40"
      >
        Redo
      </button>
    </div>
  );
}