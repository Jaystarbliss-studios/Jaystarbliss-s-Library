import React, { useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Minus,
  RotateCcw,
  RotateCw,
  Code
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write manuscript chapter narrative here...',
  minHeight = '360px'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isInternalChange.current = true;
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  };

  const exec = (command: string, arg: string | undefined = undefined) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const formatBlock = (tag: string) => {
    document.execCommand('formatBlock', false, tag);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  return (
    <div className="border border-zinc-700/80 rounded-sm bg-[#121215] overflow-hidden flex flex-col font-calibri">
      
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-[#18181c] border-b border-zinc-800 text-zinc-300">
        <button
          type="button"
          onClick={() => exec('bold')}
          title="Bold"
          className="p-1.5 hover:bg-zinc-800 hover:text-white rounded-sm transition-colors"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => exec('italic')}
          title="Italic"
          className="p-1.5 hover:bg-zinc-800 hover:text-white rounded-sm transition-colors"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => exec('underline')}
          title="Underline"
          className="p-1.5 hover:bg-zinc-800 hover:text-white rounded-sm transition-colors"
        >
          <Underline className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-zinc-700 mx-1" />

        <button
          type="button"
          onClick={() => formatBlock('<h2>')}
          title="Heading 2"
          className="p-1.5 hover:bg-zinc-800 hover:text-white rounded-sm font-cinzel text-xs font-bold transition-colors"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => formatBlock('<h3>')}
          title="Heading 3"
          className="p-1.5 hover:bg-zinc-800 hover:text-white rounded-sm font-cinzel text-xs font-bold transition-colors"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => formatBlock('<p>')}
          title="Paragraph"
          className="p-1.5 hover:bg-zinc-800 hover:text-white rounded-sm font-mono-space text-xs transition-colors"
        >
          ¶
        </button>

        <div className="h-4 w-[1px] bg-zinc-700 mx-1" />

        <button
          type="button"
          onClick={() => formatBlock('<blockquote>')}
          title="Blockquote"
          className="p-1.5 hover:bg-zinc-800 hover:text-white rounded-sm transition-colors"
        >
          <Quote className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => exec('insertUnorderedList')}
          title="Bullet List"
          className="p-1.5 hover:bg-zinc-800 hover:text-white rounded-sm transition-colors"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => exec('insertOrderedList')}
          title="Numbered List"
          className="p-1.5 hover:bg-zinc-800 hover:text-white rounded-sm transition-colors"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => exec('insertHorizontalRule')}
          title="Divider Line"
          className="p-1.5 hover:bg-zinc-800 hover:text-white rounded-sm transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-zinc-700 mx-1" />

        <button
          type="button"
          onClick={() => exec('undo')}
          title="Undo"
          className="p-1.5 hover:bg-zinc-800 hover:text-white rounded-sm transition-colors ml-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => exec('redo')}
          title="Redo"
          className="p-1.5 hover:bg-zinc-800 hover:text-white rounded-sm transition-colors"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="p-5 font-cambria text-zinc-100 text-base leading-relaxed focus:outline-none overflow-y-auto space-y-4 selection:bg-zinc-800"
        style={{ minHeight }}
        data-placeholder={placeholder}
      />

    </div>
  );
};
