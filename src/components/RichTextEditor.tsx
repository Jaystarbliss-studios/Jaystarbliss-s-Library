import React, { useEffect, useRef, useState } from 'react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  ChevronDown,
  Code2,
  Eraser,
  Highlighter,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Palette,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo2,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

type ToolbarButtonProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  label,
  active = false,
  disabled = false,
  onClick,
  children
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    disabled={disabled}
    onMouseDown={(event) => event.preventDefault()}
    onClick={onClick}
    className={`h-8 min-w-8 px-2 inline-flex items-center justify-center gap-1 rounded-md border text-xs font-medium transition-colors ${
      active
        ? 'bg-white text-slate-950 border-white shadow-sm'
        : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
    } disabled:opacity-40 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);

/**
 * Manuscript editor inspired by the Hub-Mind document workspace:
 * - high-contrast dark application chrome + bright paper editing surface
 * - office-style formatting controls
 * - preserves HTML clipboard data when available
 * - cleans common Word/Office markup without throwing away useful formatting
 * - controlled value synchronization without constantly replacing the selection
 */
export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Begin writing your manuscript chapter narrative here...',
  minHeight = '520px'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastExternalValueRef = useRef(value);
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [fontSize, setFontSize] = useState('16px');
  const [fontFamily, setFontFamily] = useState('Cambria, Georgia, serif');
  const [textColor, setTextColor] = useState('#18181b');
  const [highlightColor, setHighlightColor] = useState('#fff3a3');

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    if (value !== lastExternalValueRef.current && value !== editor.innerHTML) {
      const wasFocused = document.activeElement === editor;
      editor.innerHTML = value || '';
      if (!wasFocused) editor.scrollTop = 0;
    }

    lastExternalValueRef.current = value;
  }, [value]);

  const emitChange = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const html = editor.innerHTML;
    lastExternalValueRef.current = html;
    onChange(html);
    updateToolbarState();
  };

  const updateToolbarState = () => {
    const query = (command: string) => {
      try {
        return document.queryCommandState(command);
      } catch {
        return false;
      }
    };

    setActive({
      bold: query('bold'),
      italic: query('italic'),
      underline: query('underline'),
      strikeThrough: query('strikeThrough'),
      insertUnorderedList: query('insertUnorderedList'),
      insertOrderedList: query('insertOrderedList'),
      justifyLeft: query('justifyLeft'),
      justifyCenter: query('justifyCenter'),
      justifyRight: query('justifyRight'),
      justifyFull: query('justifyFull')
    });
  };

  const exec = (command: string, argument?: string) => {
    editorRef.current?.focus();
    try {
      document.execCommand(command, false, argument);
    } catch (error) {
      console.warn('Formatting command failed:', command, error);
    }
    emitChange();
  };

  const formatBlock = (tag: string) => {
    editorRef.current?.focus();
    try {
      document.execCommand('formatBlock', false, tag);
    } catch (error) {
      console.warn('Block formatting failed:', error);
    }
    emitChange();
  };

  const insertLink = () => {
    editorRef.current?.focus();
    const url = window.prompt('Enter the link URL');
    if (!url) return;
    exec('createLink', url);
  };

  const sanitizePastedHtml = (rawHtml: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');

    doc.querySelectorAll('script, style, meta, link, xml').forEach((node) => node.remove());
    doc.querySelectorAll('*').forEach((node) => {
      const tag = node.tagName.toLowerCase();
      if (tag === 'o:p' || tag.startsWith('v:')) node.remove();
    });

    doc.querySelectorAll('*').forEach((element) => {
      const htmlElement = element as HTMLElement;

      // Remove Office-specific classes and XML attributes while retaining useful inline styles.
      Array.from(htmlElement.attributes).forEach((attribute) => {
        const name = attribute.name.toLowerCase();
        const value = attribute.value;

        if (
          name.startsWith('on') ||
          name.startsWith('mso-') ||
          name === 'xmlns' ||
          name === 'class' && /mso|word|xl/i.test(value)
        ) {
          htmlElement.removeAttribute(attribute.name);
        }
      });

      const style = htmlElement.getAttribute('style');
      if (style) {
        const allowed = style
          .split(';')
          .map((rule) => rule.trim())
          .filter(Boolean)
          .filter((rule) => {
            const property = rule.split(':')[0]?.trim().toLowerCase();
            return [
              'font-family',
              'font-size',
              'font-weight',
              'font-style',
              'text-decoration',
              'color',
              'background-color',
              'text-align',
              'vertical-align',
              'line-height',
              'margin-left',
              'margin-right',
              'text-indent'
            ].includes(property);
          });

        htmlElement.setAttribute('style', allowed.join('; '));
      }

      const href = htmlElement.getAttribute('href');
      if (href && /^(javascript|data):/i.test(href)) {
        htmlElement.removeAttribute('href');
      }
    });

    return doc.body.innerHTML;
  };

  const escapeHtml = (text: string) => {
    const container = document.createElement('div');
    container.textContent = text;
    return container.innerHTML;
  };

  const plainTextToHtml = (text: string) => {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split(/\n{2,}/)
      .map((paragraph) => {
        const safe = paragraph
          .split('\n')
          .map((line) => escapeHtml(line.trimEnd()))
          .join('<br>');
        return `<p>${safe}</p>`;
      })
      .join('');
  };

  /**
   * Paste directly into the live contenteditable selection.
   *
   * Important: do not call focus() before inserting. The previous implementation
   * did that and could destroy the clipboard selection in Chromium/Edge.
   * We first try the browser's HTML insertion command, then a DOM Range, then
   * plain text. All three paths use the selection that exists at paste time.
   */
  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();

    const editor = editorRef.current;
    if (!editor) return;

    const html = event.clipboardData.getData('text/html');
    const text = event.clipboardData.getData('text/plain');
    const payload = html ? sanitizePastedHtml(html) : plainTextToHtml(text);

    let inserted = false;

    // Fast path: preserve the browser's native editing/undo behavior.
    try {
      inserted = document.execCommand(
        'insertHTML',
        false,
        payload || plainTextToHtml(text)
      );
    } catch (error) {
      console.warn('HTML clipboard insertion failed:', error);
    }

    // Range fallback for browsers where insertHTML is unavailable.
    if (!inserted) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0).cloneRange();
        if (editor.contains(range.commonAncestorContainer)) {
          try {
            range.deleteContents();
            const fragment = range.createContextualFragment(
              payload || plainTextToHtml(text)
            );
            const lastNode = fragment.lastChild;
            range.insertNode(fragment);

            const caret = document.createRange();
            if (lastNode) {
              caret.selectNodeContents(lastNode);
              caret.collapse(false);
            } else {
              caret.setStart(range.endContainer, range.endOffset);
              caret.collapse(true);
            }
            selection.removeAllRanges();
            selection.addRange(caret);
            inserted = true;
          } catch (error) {
            console.warn('Range clipboard insertion failed:', error);
          }
        }
      }
    }

    // Final fallback: plain text. This guarantees that Ctrl/Cmd+V never
    // silently does nothing even when a clipboard contains unusual HTML.
    if (!inserted) {
      try {
        inserted = document.execCommand('insertText', false, text);
      } catch (error) {
        console.warn('Plain-text clipboard insertion failed:', error);
      }
    }

    if (inserted) {
      emitChange();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      insertLink();
      return;
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      exec('insertText', '\\t');
    }
  };

  const handleKeyUp = () => updateToolbarState();
  const handleMouseUp = () => updateToolbarState();
  const handleInput = () => emitChange();

  const selectAll = () => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const range = document.createRange();
    range.selectNodeContents(editor);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    updateToolbarState();
  };

  const isEmpty = !value || value === '<br>' || value === '<p><br></p>';

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950 overflow-hidden shadow-xl font-calibri">
      {/* Editor title strip */}
      <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-100">
            Manuscript Document Editor
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Word-style formatting • rich paste • keyboard shortcuts
          </div>
        </div>
        <button
          type="button"
          onClick={selectAll}
          className="text-[10px] px-2.5 py-1.5 rounded-md border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          Select all
        </button>
      </div>

      {/* Formatting ribbon */}
      <div className="border-b border-slate-700 bg-slate-900">
        <div className="px-3 py-2 flex flex-wrap items-center gap-1.5">
          <ToolbarButton label="Undo" onClick={() => exec('undo')}>
            <Undo2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton label="Redo" onClick={() => exec('redo')}>
            <Redo2 className="w-4 h-4" />
          </ToolbarButton>

          <span className="w-px h-6 bg-slate-700 mx-1" />

          <select
            aria-label="Font family"
            value={fontFamily}
            onChange={(event) => {
              setFontFamily(event.target.value);
              exec('fontName', event.target.value);
            }}
            className="h-8 max-w-[180px] rounded-md border border-slate-700 bg-slate-800 px-2 text-xs text-slate-100 outline-none focus:border-slate-500"
          >
            <option value="Cambria, Georgia, serif">Cambria</option>
            <option value="Calibri, Arial, sans-serif">Calibri</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="Arial, sans-serif">Arial</option>
            <option value="Times New Roman, serif">Times New Roman</option>
          </select>

          <select
            aria-label="Font size"
            value={fontSize}
            onChange={(event) => {
              const next = event.target.value;
              setFontSize(next);
              exec('fontSize', '7');

              // execCommand only exposes 1–7 font sizes. Replace the generated
              // <font size="7"> with the exact CSS size we want.
              const editor = editorRef.current;
              if (editor) {
                editor.querySelectorAll('font[size="7"]').forEach((node) => {
                  const span = document.createElement('span');
                  span.style.fontSize = next;
                  span.innerHTML = node.innerHTML;
                  node.replaceWith(span);
                });
                emitChange();
              }
            }}
            className="h-8 w-20 rounded-md border border-slate-700 bg-slate-800 px-2 text-xs text-slate-100 outline-none focus:border-slate-500"
          >
            <option value="12px">12</option>
            <option value="14px">14</option>
            <option value="16px">16</option>
            <option value="18px">18</option>
            <option value="20px">20</option>
            <option value="24px">24</option>
            <option value="28px">28</option>
            <option value="32px">32</option>
            <option value="40px">40</option>
          </select>

          <span className="w-px h-6 bg-slate-700 mx-1" />

          <ToolbarButton label="Bold" active={active.bold} onClick={() => exec('bold')}>
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton label="Italic" active={active.italic} onClick={() => exec('italic')}>
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton label="Underline" active={active.underline} onClick={() => exec('underline')}>
            <Underline className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton label="Strikethrough" active={active.strikeThrough} onClick={() => exec('strikeThrough')}>
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>

          <span className="w-px h-6 bg-slate-700 mx-1" />

          <ToolbarButton label="Heading 1" onClick={() => formatBlock('h1')}>
            <span className="font-bold text-xs">H1</span>
          </ToolbarButton>
          <ToolbarButton label="Heading 2" onClick={() => formatBlock('h2')}>
            <span className="font-bold text-xs">H2</span>
          </ToolbarButton>
          <ToolbarButton label="Heading 3" onClick={() => formatBlock('h3')}>
            <span className="font-bold text-xs">H3</span>
          </ToolbarButton>
          <ToolbarButton label="Paragraph" onClick={() => formatBlock('p')}>
            <span className="text-xs">¶</span>
          </ToolbarButton>

          <span className="w-px h-6 bg-slate-700 mx-1" />

          <ToolbarButton label="Align left" active={active.justifyLeft} onClick={() => exec('justifyLeft')}>
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton label="Align center" active={active.justifyCenter} onClick={() => exec('justifyCenter')}>
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton label="Align right" active={active.justifyRight} onClick={() => exec('justifyRight')}>
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton label="Justify" active={active.justifyFull} onClick={() => exec('justifyFull')}>
            <AlignJustify className="w-4 h-4" />
          </ToolbarButton>

          <span className="w-px h-6 bg-slate-700 mx-1" />

          <ToolbarButton label="Bullet list" active={active.insertUnorderedList} onClick={() => exec('insertUnorderedList')}>
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton label="Numbered list" active={active.insertOrderedList} onClick={() => exec('insertOrderedList')}>
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton label="Block quote" onClick={() => formatBlock('blockquote')}>
            <Code2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton label="Horizontal divider" onClick={() => exec('insertHorizontalRule')}>
            <Minus className="w-4 h-4" />
          </ToolbarButton>

          <span className="w-px h-6 bg-slate-700 mx-1" />

          <label className="h-8 px-2 inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800 text-slate-200 cursor-pointer" title="Text color">
            <Palette className="w-3.5 h-3.5" />
            <input
              type="color"
              value={textColor}
              onChange={(event) => {
                setTextColor(event.target.value);
                exec('foreColor', event.target.value);
              }}
              className="w-5 h-5 p-0 border-0 bg-transparent cursor-pointer"
            />
          </label>

          <label className="h-8 px-2 inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800 text-slate-200 cursor-pointer" title="Highlight">
            <Highlighter className="w-3.5 h-3.5" />
            <input
              type="color"
              value={highlightColor}
              onChange={(event) => {
                setHighlightColor(event.target.value);
                exec('hiliteColor', event.target.value);
              }}
              className="w-5 h-5 p-0 border-0 bg-transparent cursor-pointer"
            />
          </label>

          <ToolbarButton label="Insert link" onClick={insertLink}>
            <Link2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton label="Remove formatting" onClick={() => exec('removeFormat')}>
            <RemoveFormatting className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton label="Clear formatting" onClick={() => exec('unlink')}>
            <Eraser className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <div className="px-3 py-1.5 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2 text-[10px] text-slate-500">
          <Check className="w-3 h-3 text-emerald-400" />
          <span>Paste from Word, Google Docs, browser pages, or another document — formatted HTML is retained where supported.</span>
          <ChevronDown className="w-3 h-3 ml-auto opacity-40" />
        </div>
      </div>

      {/* Bright manuscript paper */}
      <div className="bg-slate-800 p-3 sm:p-5">
        <div className="relative mx-auto max-w-4xl bg-white text-zinc-900 shadow-2xl border border-slate-300">
          {isEmpty && (
            <div className="pointer-events-none absolute left-8 sm:left-14 top-8 sm:top-12 text-zinc-400 font-cambria text-base italic">
              {placeholder}
            </div>
          )}

          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            spellCheck
            onInput={handleInput}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onMouseUp={handleMouseUp}
            onFocus={updateToolbarState}
            className="min-h-[520px] px-8 py-9 sm:px-14 sm:py-12 outline-none font-cambria text-[16px] leading-[1.75] selection:bg-blue-200 selection:text-zinc-950 prose prose-zinc max-w-none"
            style={{ minHeight }}
          />
        </div>
      </div>

      {/* Editor status bar */}
      <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
        <span>MANUSCRIPT MODE</span>
        <span>Ctrl/Cmd + K • Insert link</span>
      </div>
    </div>
  );
};
