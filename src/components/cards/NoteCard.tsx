import React, { useState, useRef } from 'react';
import { BoardCard } from '../../types/board';
import { Hash, Code, Eye, Edit3, Copy, Check, Bold, Italic, FileText, ChevronDown } from 'lucide-react';
import { sound } from '../../utils/sound';

interface NoteCardProps {
  card: BoardCard;
  onUpdate: (updates: Partial<BoardCard>) => void;
}

const SUPPORTED_LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python', label: 'Python' },
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
  { id: 'sql', label: 'SQL' },
  { id: 'json', label: 'JSON' },
  { id: 'bash', label: 'Bash / Shell' },
  { id: 'rust', label: 'Rust' },
  { id: 'go', label: 'Go' },
  { id: 'cpp', label: 'C / C++' },
  { id: 'text', label: 'Texto / Outro' },
];

// Client-side regex token highlighter for code blocks
const tokenizeCode = (code: string): React.ReactNode[] => {
  const tokenRegex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*|--[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b(?:const|let|var|function|return|if|else|for|while|import|export|from|class|async|await|def|try|catch|new|typeof|interface|type|extends|switch|case|break|default|SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|JOIN|LEFT|RIGHT|INNER|GROUP|BY|ORDER|HAVING|LIMIT|CREATE|TABLE|DROP|ALTER|in|range|print|self|None|True|False|elif|lambda|pass|raise|except|finally|with|as|yield|public|private|protected|static|void|int|string|bool)\b)|(\b(?:true|false|null|undefined|None|True|False|nil)\b)|(\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\())|(<\/?[a-zA-Z0-9_-]+)/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(code)) !== null) {
    if (match.index > lastIndex) {
      elements.push(code.substring(lastIndex, match.index));
    }

    const [full, comment, str, keyword, boolNull, number, fn, tag] = match;
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
    } else if (tag) {
      elements.push(<span key={key} className="text-rose-400">{tag}</span>);
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

  const isCodeMode = !!noteData.isCode;
  const currentLanguage = noteData.language || 'javascript';
  const body = noteData.body || '';

  const hasFormattingOrCode =
    isCodeMode ||
    body.includes('```') ||
    body.includes('`') ||
    body.includes('~') ||
    body.includes('**') ||
    body.startsWith('#') ||
    body.includes('\n#');

  const [isEditing, setIsEditing] = useState<boolean>(!body.trim());
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopyCode = (codeToCopy: string) => {
    navigator.clipboard.writeText(codeToCopy);
    sound.playClick();
    setCopiedCode(true);
    setTimeout(() => {
      setCopiedCode(false);
    }, 2000);
  };

  const handleToggleCodeMode = (enableCode: boolean) => {
    sound.playClick();
    let cleanedBody = body;

    // If switching to code mode and body has triple backtick fences, unwrap them cleanly
    if (enableCode) {
      const fenceMatch = body.match(/^```([a-zA-Z0-9_-]*)\n([\s\S]*?)```$/);
      if (fenceMatch) {
        cleanedBody = fenceMatch[2].trimEnd();
      }
    }

    onUpdate({
      noteData: {
        ...noteData,
        body: cleanedBody,
        isCode: enableCode,
        language: noteData.language || 'javascript',
      },
    });
  };

  const handleSelectLanguage = (lang: string) => {
    onUpdate({
      noteData: {
        ...noteData,
        language: lang,
      },
    });
  };

  // Keyboard handler in Code Mode (Tab inserts 2 spaces, Enter keeps indent)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isCodeMode) return;

    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newBody = body.substring(0, start) + '  ' + body.substring(end);

      onUpdate({
        noteData: {
          ...noteData,
          body: newBody,
        },
      });

      setTimeout(() => {
        textarea.setSelectionRange(start + 2, start + 2);
      }, 0);
    } else if (e.key === 'Enter') {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const currentLine = body.substring(0, start).split('\n').pop() || '';
      const indentMatch = currentLine.match(/^\s+/);
      const indent = indentMatch ? indentMatch[0] : '';

      if (indent.length > 0) {
        e.preventDefault();
        const end = textarea.selectionEnd;
        const newBody = body.substring(0, start) + '\n' + indent + body.substring(end);

        onUpdate({
          noteData: {
            ...noteData,
            body: newBody,
          },
        });

        setTimeout(() => {
          textarea.setSelectionRange(start + 1 + indent.length, start + 1 + indent.length);
        }, 0);
      }
    }
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

  // Render markdown blocks with code syntax containers (Text Mode)
  const renderTextBlocks = () => {
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
                handleCopyCode(rawCode);
              }}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/10 hover:text-white transition-colors text-[10px]"
            >
              <Copy className="w-3 h-3" />
              <span>Copiar</span>
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

  // Pure Code Mode View (line numbers + syntax highlight + clean copy)
  const renderPureCodeView = () => {
    const lines = body.split('\n');

    return (
      <div
        className="rounded-lg bg-[#0d1117] border border-neutral-800 overflow-hidden shadow-inner select-text"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#161b22] border-b border-neutral-800 text-[10px] text-neutral-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="uppercase font-semibold tracking-wider text-neutral-200">
              {currentLanguage}
            </span>
            <span className="text-neutral-500">({lines.length} {lines.length === 1 ? 'linha' : 'linhas'})</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCopyCode(body);
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 hover:text-white transition-colors text-[10px]"
          >
            {copiedCode ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copiar Código</span>
              </>
            )}
          </button>
        </div>

        <div className="p-3 flex text-[11.5px] font-mono leading-relaxed overflow-x-auto text-neutral-200">
          {/* Line Numbers Gutter */}
          <div className="select-none pr-3 text-right text-neutral-600 border-r border-neutral-800/80 mr-3">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Code Body */}
          <pre className="flex-1 overflow-x-auto">
            <code>{tokenizeCode(body)}</code>
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2 text-neutral-300">
      {/* Top Controls: Mode Switcher (Texto vs Código) + Toolbars */}
      <div className="flex items-center justify-between pb-1.5 border-b border-white/5 text-[11px] gap-2 flex-wrap">
        {/* Toggle Mode: [ Texto | Código ] */}
        <div className="flex items-center bg-black/40 p-0.5 rounded-lg border border-white/10 select-none">
          <button
            type="button"
            onClick={() => handleToggleCodeMode(false)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
              !isCodeMode
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>Texto</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleCodeMode(true)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
              isCodeMode
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-emerald-300'
            }`}
          >
            <Code className="w-3 h-3 text-emerald-400" />
            <span>Código</span>
          </button>
        </div>

        {/* Code Mode Options: Language Selector & Copy */}
        {isCodeMode ? (
          <div className="flex items-center gap-1.5">
            <div className="relative flex items-center">
              <select
                value={currentLanguage}
                onChange={(e) => handleSelectLanguage(e.target.value)}
                onPointerDown={(e) => e.stopPropagation()}
                className="bg-black/40 border border-white/10 text-neutral-300 hover:text-white rounded px-2 py-0.5 text-[10px] font-mono focus:outline-none focus:border-emerald-500/50 appearance-none pr-5 cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id} className="bg-neutral-900 text-neutral-200">
                    {l.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-2.5 h-2.5 text-neutral-400 absolute right-1.5 pointer-events-none" />
            </div>

            <button
              type="button"
              title="Copiar código inteiro"
              onClick={() => handleCopyCode(body)}
              className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            >
              {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        ) : (
          /* Text Mode Toolbar: Bold, Italic */
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
          </div>
        )}

        {/* View / Edit Mode Toggle Button */}
        <button
          type="button"
          title={isEditing ? 'Visualizar código formatado' : 'Editar'}
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

      {/* Editor vs Formatted View */}
      {isEditing ? (
        <div className="relative">
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
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (hasFormattingOrCode && body.trim()) {
                setIsEditing(false);
              }
            }}
            onPointerDown={(e) => e.stopPropagation()}
            rows={isCodeMode ? 6 : 5}
            placeholder={
              isCodeMode
                ? '// Cole ou digite seu código aqui...\n// Ajuste automático de sintaxe e indentação'
                : 'Escreva sua nota aqui... Use ~código~ para código rápido'
            }
            className={`w-full text-xs leading-relaxed placeholder-neutral-500 resize-y border focus:outline-none rounded-lg p-2 min-h-[90px] transition-all ${
              isCodeMode
                ? 'bg-[#0a0d14] font-mono text-emerald-300 border-emerald-500/20 focus:border-emerald-500/50 shadow-inner'
                : 'bg-transparent text-neutral-200 border-transparent'
            }`}
          />
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          title="Clique para editar"
          className="min-h-[72px] cursor-text rounded transition-colors"
        >
          {body.trim() ? (
            isCodeMode ? (
              renderPureCodeView()
            ) : (
              renderTextBlocks()
            )
          ) : (
            <span className="text-xs text-neutral-500 italic">
              {isCodeMode ? 'Código vazio. Clique para colar ou digitar...' : 'Nota vazia. Clique para escrever...'}
            </span>
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
