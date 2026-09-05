"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { EditorContent, useEditor, useEditorState, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  iconBold,
  iconCode,
  iconHash,
  iconItalic,
  iconLink,
  iconList,
  iconMessageSquare,
  iconMinus,
  iconRefreshCw,
  iconRotateCcw,
  iconType,
  iconUnderline,
} from "@okkly/icons";
import "@okkly/design-system/components/RichEditor/RichEditor.scss";

export type RichEditorColor = "primary" | "dante";
export type RichEditorFormat = "html" | "json";
export type RichEditorToolbar = "full" | "compact" | "none";
export type RichEditorValue = string | JSONContent;

type SaveStatus = "saved" | "dirty";

type SlashItem = {
  id: string;
  label: string;
  kbd: string;
  icon: string;
  keywords: string[];
  run: () => void;
};

/**
 * TipTap-based rich text editor. No MUI equivalent — closest is a custom
 * composition of MUI TextField + a third-party editor; this design's toolbar,
 * slash menu, word counter, and autosave status have no direct API to mirror.
 *
 * Deliberate gaps vs catalog: no `markdown` format, no `bubble` toolbar,
 * no `blocks`/`marks` allow-lists (all StarterKit + Underline + Link marks
 * are always available).
 */
export interface RichEditorProps {
  /**
   * Document value. HTML string by default; JSONContent when `format="json"`.
   *
   * @default undefined
   * @type {RichEditorValue}
   */
  value?: RichEditorValue;
  /**
   * Uncontrolled initial document.
   *
   * @default undefined
   * @type {RichEditorValue}
   */
  defaultValue?: RichEditorValue;
  /**
   * Fires on every content update with the serialized document.
   *
   * @default undefined
   * @type {(value: string | JSONContent) => void}
   */
  onChange?: (value: string | JSONContent) => void;
  /**
   * Serialization of `value` / `onChange`.
   *
   * @default "html"
   * @type {RichEditorFormat}
   */
  format?: RichEditorFormat;
  /**
   * Which formatting bar is shown. Hidden when `readonly`.
   *
   * @default "full"
   * @type {RichEditorToolbar}
   */
  toolbar?: RichEditorToolbar;
  /**
   * Empty-document hint.
   *
   * @default "Write something…"
   * @type {string}
   */
  placeholder?: string;
  /**
   * Soft character limit — shows error styling when exceeded.
   *
   * @default undefined
   * @type {number}
   */
  maxLength?: number;
  /**
   * Idle ms before status flips to "Saved". While dirty shows "Not saved". Pass `false` to hide the save status.
   *
   * @default 5000
   * @type {number | false}
   */
  autosave?: number | false;
  /**
   * “/” opens the block picker in an empty paragraph.
   *
   * @default true
   * @type {boolean}
   */
  slashMenu?: boolean;
  /**
   * Renders the document only — no toolbar, no editing.
   *
   * @default false
   * @type {boolean}
   */
  readonly?: boolean;
  /**
   * Non-interactive; dims to 40%.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Marks invalid + red border.
   *
   * @default false
   * @type {boolean}
   */
  error?: boolean;
  /**
   * Field label above the shell.
   *
   * @default undefined
   * @type {ReactNode}
   */
  label?: ReactNode;
  /**
   * Caption below the shell.
   *
   * @default undefined
   * @type {ReactNode}
   */
  helperText?: ReactNode;
  /**
   * Stretch to container width (default true).
   *
   * @default true
   * @type {boolean}
   */
  fullWidth?: boolean;
  /**
   * Tints the focus ring/glow. `dante` is a rare accent moment.
   *
   * @default "primary"
   * @type {RichEditorColor}
   */
  color?: RichEditorColor;
  /**
   * Class Name.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
  /**
   * Id.
   *
   * @default undefined
   * @type {string}
   */
  id?: string;
}

function Icon({ svg, label }: { svg: string; label: string }) {
  return <span aria-hidden dangerouslySetInnerHTML={{ __html: svg }} title={label} />;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(/\s+/).length;
}

function serialize(
  editor: NonNullable<ReturnType<typeof useEditor>>,
  format: RichEditorFormat,
): RichEditorValue {
  return format === "json" ? editor.getJSON() : editor.getHTML();
}

function valuesEqual(
  a: RichEditorValue | undefined,
  b: RichEditorValue | undefined,
  format: RichEditorFormat,
): boolean {
  if (a === b) {
    return true;
  }
  if (a == null || b == null) {
    return false;
  }
  if (format === "json") {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return String(a) === String(b);
}

export function RichEditor({
  value,
  defaultValue,
  onChange,
  format = "html",
  toolbar = "full",
  placeholder = "Write something…",
  maxLength,
  autosave = 5000,
  slashMenu = true,
  readonly = false,
  disabled = false,
  error = false,
  label,
  helperText,
  fullWidth = true,
  color = "primary",
  className,
  id,
}: RichEditorProps) {
  const generatedId = useId();
  const editorId = id ?? generatedId;
  const labelId = `${editorId}-label`;
  const helperId = `${editorId}-helper`;

  const isControlled = value !== undefined;
  const initialContent = useMemo(() => {
    const seed = isControlled ? value : defaultValue;
    return seed ?? "";
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- mount-only seed

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [slashQuery, setSlashQuery] = useState<string | null>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextEmit = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editable = !readonly && !disabled;

  const clearAutosaveTimer = useCallback(() => {
    if (autosaveTimer.current != null) {
      clearTimeout(autosaveTimer.current);
      autosaveTimer.current = null;
    }
  }, []);

  const markDirty = useCallback(() => {
    if (autosave === false) {
      return;
    }
    setSaveStatus("dirty");
    clearAutosaveTimer();
    autosaveTimer.current = setTimeout(() => {
      setSaveStatus("saved");
      autosaveTimer.current = null;
    }, autosave);
  }, [autosave, clearAutosaveTimer]);

  useEffect(() => () => clearAutosaveTimer(), [clearAutosaveTimer]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2] },
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: initialContent,
    editable,
    editorProps: {
      attributes: {
        id: editorId,
        class: "okkly-rich-editor__prose",
        ...(label ? { "aria-labelledby": labelId } : {}),
        ...(disabled ? { "aria-disabled": "true" } : {}),
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (skipNextEmit.current) {
        skipNextEmit.current = false;
      } else {
        onChangeRef.current?.(serialize(ed, format));
        markDirty();
      }

      if (!slashMenu || !ed.isEditable) {
        setSlashQuery(null);
        return;
      }

      const { $from } = ed.state.selection;
      const parent = $from.parent;
      if (!parent.isTextblock || parent.type.name !== "paragraph") {
        setSlashQuery(null);
        return;
      }
      const text = parent.textContent;
      if (text.startsWith("/") && !text.includes("\n") && $from.parentOffset === text.length) {
        setSlashQuery(text.slice(1));
      } else {
        setSlashQuery(null);
      }
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.setEditable(editable);
  }, [editor, editable]);

  useEffect(() => {
    if (!editor || !isControlled) {
      return;
    }
    const current = serialize(editor, format);
    if (valuesEqual(value, current, format)) {
      return;
    }
    skipNextEmit.current = true;
    editor.commands.setContent(value ?? "", { emitUpdate: false });
  }, [editor, value, format, isControlled]);

  const editorState = useEditorState({
    editor,
    selector: ({ editor: ed }) => {
      if (!ed) {
        return {
          wordCount: 0,
          charCount: 0,
          isBold: false,
          isItalic: false,
          isUnderline: false,
          isCode: false,
          isLink: false,
          isBullet: false,
          isOrdered: false,
          isQuote: false,
          isHeading: false,
          canUndo: false,
          canRedo: false,
        };
      }
      const text = ed.getText();
      return {
        wordCount: countWords(text),
        charCount: text.length,
        isBold: ed.isActive("bold"),
        isItalic: ed.isActive("italic"),
        isUnderline: ed.isActive("underline"),
        isCode: ed.isActive("code"),
        isLink: ed.isActive("link"),
        isBullet: ed.isActive("bulletList"),
        isOrdered: ed.isActive("orderedList"),
        isQuote: ed.isActive("blockquote"),
        isHeading: ed.isActive("heading", { level: 2 }),
        canUndo: ed.can().undo(),
        canRedo: ed.can().redo(),
      };
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }
    const invalid = error || (maxLength != null && editorState.charCount > maxLength);
    const describedBy = helperText != null || invalid ? helperId : undefined;
    editor.setOptions({
      editorProps: {
        attributes: {
          id: editorId,
          class: "okkly-rich-editor__prose",
          ...(label ? { "aria-labelledby": labelId } : {}),
          ...(describedBy ? { "aria-describedby": describedBy } : {}),
          ...(disabled ? { "aria-disabled": "true" } : {}),
          ...(invalid ? { "aria-invalid": "true" } : {}),
        },
      },
    });
  }, [
    editor,
    editorId,
    label,
    labelId,
    helperId,
    helperText,
    disabled,
    error,
    maxLength,
    editorState.charCount,
  ]);

  const overLimit = maxLength != null && editorState.charCount > maxLength;
  const showError = error || overLimit;
  const resolvedHelper =
    helperText ??
    (overLimit && maxLength != null
      ? `Content exceeds ${maxLength.toLocaleString("en-US")} characters`
      : undefined);

  const clearSlashAndRun = useCallback(
    (command: () => void) => {
      if (!editor) {
        return;
      }
      const { $from } = editor.state.selection;
      const start = $from.start();
      const text = $from.parent.textContent;
      if (text.startsWith("/")) {
        editor
          .chain()
          .focus()
          .deleteRange({ from: start, to: start + text.length })
          .run();
      }
      command();
      setSlashQuery(null);
    },
    [editor],
  );

  const slashItems: SlashItem[] = useMemo(() => {
    if (!editor) {
      return [];
    }
    return [
      {
        id: "heading",
        label: "Heading 2",
        kbd: "##",
        icon: iconType,
        keywords: ["heading", "h2", "title"],
        run: () => clearSlashAndRun(() => editor.chain().focus().toggleHeading({ level: 2 }).run()),
      },
      {
        id: "bullet",
        label: "Bullet list",
        kbd: "-",
        icon: iconList,
        keywords: ["bullet", "list", "ul"],
        run: () => clearSlashAndRun(() => editor.chain().focus().toggleBulletList().run()),
      },
      {
        id: "ordered",
        label: "Numbered list",
        kbd: "1.",
        icon: iconHash,
        keywords: ["numbered", "ordered", "ol", "list"],
        run: () => clearSlashAndRun(() => editor.chain().focus().toggleOrderedList().run()),
      },
      {
        id: "quote",
        label: "Quote",
        kbd: ">",
        icon: iconMessageSquare,
        keywords: ["quote", "blockquote"],
        run: () => clearSlashAndRun(() => editor.chain().focus().toggleBlockquote().run()),
      },
      {
        id: "code",
        label: "Code block",
        kbd: "```",
        icon: iconCode,
        keywords: ["code", "pre", "block"],
        run: () => clearSlashAndRun(() => editor.chain().focus().toggleCodeBlock().run()),
      },
    ];
  }, [editor, clearSlashAndRun]);

  const filteredSlashItems =
    slashQuery == null
      ? []
      : slashItems.filter((item) => {
          const q = slashQuery.toLowerCase();
          if (!q) {
            return true;
          }
          return (
            item.label.toLowerCase().includes(q) ||
            item.keywords.some((k) => k.includes(q) || q.includes(k))
          );
        });

  const showToolbar = toolbar !== "none" && !readonly;
  const compact = toolbar === "compact";

  const setLink = () => {
    if (!editor) {
      return;
    }
    const previous = editor.getAttributes("link").href as string | undefined;

    const url = window.prompt("URL", previous ?? "https://");
    if (url === null) {
      return;
    }
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const classes = [
    "okkly-component",
    "okkly-rich-editor",
    color !== "primary" && `okkly-rich-editor--color-${color}`,
    !fullWidth && "okkly-rich-editor--not-full-width",
    showError && "okkly-rich-editor--error",
    disabled && "okkly-rich-editor--disabled",
    readonly && "okkly-rich-editor--readonly",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const tool = (opts: {
    label: string;
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
    icon?: string;
    text?: string;
  }) => (
    <button
      key={opts.label}
      type="button"
      className={`okkly-rich-editor__tool${opts.active ? " okkly-rich-editor__tool--active" : ""}`}
      title={opts.label}
      aria-label={opts.label}
      aria-pressed={opts.active}
      disabled={opts.disabled || !editable}
      onClick={opts.onClick}
    >
      {opts.icon ? <Icon svg={opts.icon} label={opts.label} /> : null}
      {opts.text ? <span>{opts.text}</span> : null}
    </button>
  );

  return (
    <div className={classes}>
      {label && (
        <label id={labelId} htmlFor={editorId} className="okkly-rich-editor__label">
          {label}
        </label>
      )}

      <div className="okkly-rich-editor__shell">
        {showToolbar && editor && (
          <div className="okkly-rich-editor__toolbar" role="toolbar" aria-label="Formatting">
            <div className="okkly-rich-editor__toolbar-left">
              {!compact && (
                <>
                  {tool({
                    label: "Heading 2",
                    icon: iconType,
                    text: editorState.isHeading ? "Heading 2" : "Paragraph",
                    active: editorState.isHeading,
                    onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
                  })}
                  <span className="okkly-rich-editor__sep" aria-hidden />
                </>
              )}

              <div className="okkly-rich-editor__group">
                {tool({
                  label: "Bold",
                  icon: iconBold,
                  active: editorState.isBold,
                  onClick: () => editor.chain().focus().toggleBold().run(),
                })}
                {tool({
                  label: "Italic",
                  icon: iconItalic,
                  active: editorState.isItalic,
                  onClick: () => editor.chain().focus().toggleItalic().run(),
                })}
                {tool({
                  label: "Underline",
                  icon: iconUnderline,
                  active: editorState.isUnderline,
                  onClick: () => editor.chain().focus().toggleUnderline().run(),
                })}
                {tool({
                  label: "Inline code",
                  icon: iconCode,
                  active: editorState.isCode,
                  onClick: () => editor.chain().focus().toggleCode().run(),
                })}
              </div>

              <span className="okkly-rich-editor__sep" aria-hidden />

              <div className="okkly-rich-editor__group">
                {!compact &&
                  tool({
                    label: "Link",
                    icon: iconLink,
                    active: editorState.isLink,
                    onClick: setLink,
                  })}
                {tool({
                  label: "Bullet list",
                  icon: iconList,
                  active: editorState.isBullet,
                  onClick: () => editor.chain().focus().toggleBulletList().run(),
                })}
                {tool({
                  label: "Numbered list",
                  icon: iconHash,
                  active: editorState.isOrdered,
                  onClick: () => editor.chain().focus().toggleOrderedList().run(),
                })}
                {!compact &&
                  tool({
                    label: "Blockquote",
                    icon: iconMessageSquare,
                    active: editorState.isQuote,
                    onClick: () => editor.chain().focus().toggleBlockquote().run(),
                  })}
              </div>

              {!compact && (
                <>
                  <span className="okkly-rich-editor__sep" aria-hidden />
                  <div className="okkly-rich-editor__group">
                    {tool({
                      label: "Horizontal rule",
                      icon: iconMinus,
                      onClick: () => editor.chain().focus().setHorizontalRule().run(),
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="okkly-rich-editor__toolbar-right">
              {tool({
                label: "Undo",
                icon: iconRotateCcw,
                disabled: !editorState.canUndo,
                onClick: () => editor.chain().focus().undo().run(),
              })}
              {tool({
                label: "Redo",
                icon: iconRefreshCw,
                disabled: !editorState.canRedo,
                onClick: () => editor.chain().focus().redo().run(),
              })}
            </div>
          </div>
        )}

        <div className="okkly-rich-editor__content">
          <EditorContent editor={editor} />
          {slashQuery != null && filteredSlashItems.length > 0 && (
            <div className="okkly-rich-editor__slash" role="listbox" aria-label="Insert block">
              <div className="okkly-rich-editor__slash-query">
                <span className="okkly-rich-editor__slash-prefix">/</span>
                <span>{slashQuery || "…"}</span>
              </div>
              {filteredSlashItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  className="okkly-rich-editor__slash-item"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    item.run();
                  }}
                >
                  <span className="okkly-rich-editor__slash-item-main">
                    <Icon svg={item.icon} label={item.label} />
                    {item.label}
                  </span>
                  <span className="okkly-rich-editor__slash-kbd">{item.kbd}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="okkly-rich-editor__footer">
          <span>{readonly ? "Read-only" : "Markdown & ⌘B ⌘I ⌘K"}</span>
          <div className="okkly-rich-editor__footer-meta">
            <span>
              {editorState.wordCount} {editorState.wordCount === 1 ? "word" : "words"}
            </span>
            {autosave !== false && !readonly && (
              <span className="okkly-rich-editor__status">
                <span
                  className={`okkly-rich-editor__status-dot${
                    saveStatus === "dirty" ? " okkly-rich-editor__status-dot--danger" : ""
                  }`}
                  aria-hidden
                />
                {saveStatus === "dirty" ? "Not saved" : "Saved"}
              </span>
            )}
          </div>
        </div>
      </div>

      {resolvedHelper != null && resolvedHelper !== "" && (
        <span id={helperId} className="okkly-rich-editor__helper">
          {resolvedHelper}
        </span>
      )}
    </div>
  );
}
