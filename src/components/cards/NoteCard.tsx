import React, { useState, useRef } from 'react';
import { BoardCard } from '../../types/board';
import { Hash, Code, Eye, Edit3, Copy, Check, Bold, Italic } from 'lucide-react';
import { sound } from '../../utils/sound';

interface NoteCardProps {
  card: BoardCard;
  onUpdate: (updates: Partial<BoardCard>) => void;
}

// Client-side regex token highlighter for code blocks
const tokenizeCode = (code: string): React.ReactNode[] => {
  const tokenRegex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b(?:const|let|var|function|return|if|else|for|while|import|export|from|class|async|await|def|try|catch|new|typeof|interface|type|extends|switch|case|break|default)\b)|(\b(?:true|false|null|undefined|None|True|False)\b)|(\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\())/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(code)) !== null) {
    if (match.index > lastIndex) {
      elements.push(code.substring(lastIndex, match.index));
    }

    const [full, comment, str, keyword, boolNull, number, fn] = match;
    const key = `tok-${match.index}-${full}`;

    if (comment) {
      elements.push(<span key={key} className="text-neutral-500 italic">{comment}</span>);
    } else if (str) {
      elements.push(<span key={key} className="text-emerald-400">{str}</span>);
    } else if (keyword) {
      elements.push(<span key={key} className="text-purple-400 font-semibold">{keyword}</span>);
    } else if (boolNull) {
      elements.push(<span key={key} className="text-amber-400 font-semibold">{boolNull}</span>);
    } else if (number) {
      elements.push(<span key={key} className="text-orange-400">{number}</span>);
    } else if (fn) {
      elements.push(<span key={key} className="text-cyan-300">{fn}</span>);
    }

    lastIndex = match.index + full.length;
  }

  if (lastIndex < code.length) {
    elements.push(code.substring(lastIndex));
  }

  return elements;
};

// Inline markdown parser (handles ~codigo~, `codigo`, **bold**, *italic*)
const renderInlineTokens = (text: string): React.ReactNode[] => {
  const inlineRegex = /(`([^`]+)`|~([^~]+)~|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = inlineRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }

    const [full, , backtickCode, tildeCode, bold, italic] = match;
    const key = `inline-${match.index}-${full}`;
    const codeContent = backtickCode || tildeCode;

    if (codeContent) {
      elements.push(
        <code
          key={key}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-neutral-800 text-emerald-300 font-mono text-[11px] border border-neutral-700/60 font-medium"
        >
          {codeContent}
        </code>
      );
    } else if (bold) {
      elements.push(
        <strong key={key} className="font-bold text-neutral-100">
          {bold}
        </strong>
      );
    } else if (italic) {
      elements.push(
        <em key={key} className="italic text-neutral-300">
          {italic}
        </em>
      );
    }

    lastIndex = match.index + full.length;
  }

  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return elements;
};

const renderTextParagraphs = (rawText: string): React.ReactNode[] => {
  const lines = rawText.split('\n');
  return lines.map((line, idx) => {
    if (!line.trim()) {
      return <div key={`empty-${idx}`} className="h-1.5" />;
    }
    if (line.startsWith('# ')) {
      return (
        <h3 key={`h1-${idx}`} className="text-sm font-bold text-white mt-1 mb-0.5">
          {renderInlineTokens(line.substring(2))}
        </h3>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h4 key={`h2-${idx}`} className="text-xs font-bold text-neutral-200 mt-1 mb-0.5">
          {renderInlineTokens(line.substring(3))}
        </h4>
      );
    }
    if (line.startsWith('### ')) {
      return (
        <h5 key={`h3-${idx}`} className="text-xs font-semibold text-neutral-300 mt-0.5 mb-0.5">
          {renderInlineTokens(line.substring(4))}
        </h5>
      );
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <div key={`li-${idx}`} className="flex items-start gap-1.5 ml-2 text-xs text-neutral-300">
          <span className="text-indigo-400 select-none">•</span>
          <span>{renderInlineTokens(line.substring(2))}</span>
        </div>
      );
    }
    if (line.startsWith('> ')) {
      return (
        <blockquote key={`quote-${idx}`} className="border-l-2 border-indigo-500/70 pl-2 text-xs italic text-neutral-400 my-1">
          {renderInlineTokens(line.substring(2))}
        </blockquote>
      );
    }
    return (
      <p key={`p-${idx}`} className="text-xs leading-relaxed text-neutral-200 my-0.5">
        {renderInlineTokens(line)}
      </p>
    );
  });
};

export const NoteCard: React.FC<NoteCardProps> = ({ card, onUpdate }) => {
  const noteData = card.noteData || {
    title: card.title,
    body: '',
    tags: [],
  };

  const body = noteData.body || '';
  const hasFormattingOrCode =
    body.includes('```') ||
    body.includes('`') ||
    body.includes('~') ||
    body.includes('**') ||
    body.startsWith('#') ||
    body.includes('\n#');

  const [isEditing, setIsEditing] = useState<boolean>(!body.trim() || !hasFormattingOrCode);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopyCode = (codeToCopy: string, index: number) => {
    navigator.clipboard.writeText(codeToCopy);
    sound.playClick();
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex((prev) => (prev === index ? null : prev));
    }, 2000);
  };

  const insertFormatting = (prefix: string, suffix: string, defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = body.substring(start, end) || defaultText;

    const newBody = body.substring(0, start) + prefix + selected + suffix + body.substring(end);
    onUpdate({
      noteData: {
        ...noteData,
        body: newBody,
      },
    });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  const handleInsertCodeBlock = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = body.substring(start, end);

    if (selected.includes('\n') || (!selected && !body)) {
      insertFormatting('```javascript\n', '\n```', selected || '// Seu código aqui');
    } else if (selected) {
      insertFormatting('~', '~', selected);
    } else {
      insertFormatting('```javascript\n', '\n```', '// Seu código aqui');
    }
  };

  // Render markdown blocks with code syntax containers
  const renderBlocks = () => {
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const blocks: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let blockIndex = 0;

    while ((match = codeBlockRegex.exec(body)) !== null) {
      if (match.index > lastIndex) {
        const textPart = body.substring(lastIndex, match.index);
        blocks.push(
          <div key={`txt-${lastIndex}`} className="space-y-0.5">
            {renderTextParagraphs(textPart)}
          </div>
        );
      }

      const lang = match[1] || 'código';
      const rawCode = match[2].trimEnd();
      const currentIdx = blockIndex++;

      blocks.push(
        <div
          key={`code-block-${match.index}`}
          className="my-2 rounded-lg bg-[#0d1117] border border-neutral-800 overflow-hidden shadow-inner select-text"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#161b22] border-b border-neutral-800 text-[10px] text-neutral-400 font-mono">
            <span className="uppercase font-semibold tracking-wider text-neutral-300">
              {lang}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyCode(rawCode, currentIdx);
              }}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/10 hover:text-white transition-colors text-[10px]"
            >
              {copiedIndex === currentIdx ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3 text-[11.5px] font-mono leading-relaxed overflow-x-auto text-neutral-200">
            <code>{tokenizeCode(rawCode)}</code>
          </pre>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < body.length) {
      const remainingText = body.substring(lastIndex);
      blocks.push(
        <div key={`txt-${lastIndex}`} className="space-y-0.5">
          {renderTextParagraphs(remainingText)}
        </div>
      );
    }

    return blocks;
  };

  return (
    <div className="space-y-2 text-neutral-300">
      {/* Quick Formatting Toolbar */}
      <div className="flex items-center justify-between pb-1 border-b border-white/5 text-[11px] text-neutral-400">
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Negrito (**texto**)"
            onClick={() => insertFormatting('**', '**', 'negrito')}
            className="p-1 rounded hover:bg-white/10 hover:text-neutral-200 transition-colors"
          >
            <Bold className="w-3 h-3" />
          </button>
          <button
            type="button"
            title="Itálico (*texto*)"
            onClick={() => insertFormatting('*', '*', 'itálico')}
            className="p-1 rounded hover:bg-white/10 hover:text-neutral-200 transition-colors"
          >
            <Italic className="w-3 h-3" />
          </button>
          <button
            type="button"
            title="Formatar Código (~código~ ou bloco ```)"
            onClick={handleInsertCodeBlock}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <Code className="w-3 h-3" />
            <span className="text-[10px] font-mono">Código</span>
          </button>
        </div>

        <button
          type="button"
          title={isEditing ? 'Visualizar notas formatadas e blocos de código' : 'Editar nota'}
          onClick={() => {
            setIsEditing(!isEditing);
            sound.playClick();
          }}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/10 text-neutral-400 hover:text-neutral-200 transition-colors text-[10px]"
        >
          {isEditing ? (
            <>
              <Eye className="w-3 h-3" />
              <span>Visualizar</span>
            </>
          ) : (
            <>
              <Edit3 className="w-3 h-3" />
              <span>Editar</span>
            </>
          )}
        </button>
      </div>

      {/* Editor Mode vs Formatted Code / Markdown View */}
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) =>
            onUpdate({
              noteData: {
                ...noteData,
                body: e.target.value,
              },
            })
          }
          onBlur={() => {
            if (hasFormattingOrCode && body.trim()) {
              setIsEditing(false);
            }
          }}
          onPointerDown={(e) => e.stopPropagation()}
          rows={5}
          placeholder="Escreva sua nota aqui... Use ~código~ ou ```js para blocos de código"
          className="w-full bg-transparent text-xs leading-relaxed text-neutral-200 placeholder-neutral-500 resize-y border-none focus:outline-none rounded p-1 min-h-[90px]"
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          title="Clique para editar"
          className="min-h-[72px] cursor-text rounded p-1 hover:bg-white/[0.02] transition-colors"
        >
          {body.trim() ? (
            renderBlocks()
          ) : (
            <span className="text-xs text-neutral-500 italic">Nota vazia. Clique para escrever...</span>
          )}
        </div>
      )}

      {/* Tags if any */}
      {noteData.tags && noteData.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1 border-t border-white/5">
          {noteData.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-neutral-400 flex items-center gap-0.5"
            >
              <Hash className="w-2.5 h-2.5 opacity-60" />
              {tag.replace(/^#/, '')}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
