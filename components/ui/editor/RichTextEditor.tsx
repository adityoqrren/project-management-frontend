"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";

import RichTextToolbar from "./RichTextToolbar";
import { useState } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({
  content,
  onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      Underline,
    ],
    content,
    editorProps: {
      // prevent automatic open link when click link
      handleClick: (view, pos, event) => {
        const target = event.target;

        if (target instanceof HTMLAnchorElement) {
          event.preventDefault();
          return true;
        }

        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const [linkPopup, setLinkPopup] = useState<{
    url: string;
    x: number;
    y: number;
  } | null>(null);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-md border"
      onClick={(event) => {
        const target = event.target;

        if (!(target instanceof HTMLAnchorElement)) {
          setLinkPopup(null);
          return;
        }

        event.preventDefault();

        setLinkPopup({
          url: target.href,
          x: event.clientX,
          y: event.clientY,
        });
      }}>
      <RichTextToolbar editor={editor} />

      <EditorContent
        editor={editor}
        className="
          prose
          prose-sm
          max-w-none
          min-h-40
          px-4
          py-3
          text-gray-900
          focus:outline-none
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror_p]:my-1
          [&_.ProseMirror_h1]:my-2
          [&_.ProseMirror_h2]:my-2
          [&_.ProseMirror_h3]:my-2
          [&_.ProseMirror_ul]:my-1
          [&_.ProseMirror_ol]:my-1
          [&_.ProseMirror_blockquote]:my-2
        [&_.ProseMirror_a]:text-blue-600
          [&_.ProseMirror_a]:underline
        [&_.ProseMirror_a]:hover:text-blue-700
        "
      />

      {linkPopup && (
        <div
          className="fixed z-50 rounded-md border bg-white px-3 py-2 shadow-md"
          style={{
            left: linkPopup.x,
            top: linkPopup.y + 8,
          }}
        >
          <button
            type="button"
            onClick={() => {
              window.open(
                linkPopup.url,
                "_blank",
                "noopener,noreferrer"
              );

              setLinkPopup(null);
            }}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Open link
          </button>
        </div>
      )}
    </div>
  );
}