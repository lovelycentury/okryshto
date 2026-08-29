"use client";

import type { CSSProperties, ReactNode } from "react";
import { iconCheck, iconX } from "@okryshto/icons";
import "@okryshto/design-system/components/BrandDocs/BrandDocs.scss";

export function BrandDocsPage({ children }: { children: ReactNode }) {
  return <div className="okryshto-brand-docs">{children}</div>;
}

export function BrandDocsHeader({
  eyebrow,
  title,
  lede,
  showRule = false,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  showRule?: boolean;
}) {
  return (
    <>
      <header>
        <p className="okryshto-brand-docs__eyebrow">{eyebrow}</p>
        <h1 className="okryshto-brand-docs__title">{title}</h1>
        <p className="okryshto-brand-docs__lede">{lede}</p>
      </header>
      {showRule ? <hr className="okryshto-brand-docs__rule" /> : null}
    </>
  );
}

export function BrandDocsSection({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className="okryshto-brand-docs__section">
      <div>
        <h2 className="okryshto-brand-docs__section-title">{title}</h2>
        {note ? <p className="okryshto-brand-docs__section-note">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

/** Running prose. */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div>
      <p className="okryshto-brand-docs__prose">{children}</p>
    </div>
  );
}

export function Card({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="okryshto-brand-docs__card">
      {title ? <h3 className="okryshto-brand-docs__card-title">{title}</h3> : null}
      {subtitle ? <p className="okryshto-brand-docs__card-subtitle">{subtitle}</p> : null}
      {children}
    </div>
  );
}

/** Cards that share a row evenly, unlike the fixed-width tiles in `__grid`. */
export function CardRack({ children }: { children: ReactNode }) {
  return <div className="okryshto-brand-docs__cards">{children}</div>;
}

export function Code({ children }: { children: ReactNode }) {
  return <code className="okryshto-brand-docs__code">{children}</code>;
}

export function CodeBlock({ children }: { children: string }) {
  return <pre className="okryshto-brand-docs__pre">{children}</pre>;
}

export function PillRow({ items }: { items: string[] }) {
  return (
    <div className="okryshto-brand-docs__pill-row">
      {items.map((item) => (
        <span key={item} className="okryshto-brand-docs__pill">
          {item}
        </span>
      ))}
    </div>
  );
}

/**
 * Contents of the page, as plain cards rather than links: brand docs scroll
 * inside the canvas decorator, not the document, so `#hash` anchors would point
 * at a scrollport the browser does not drive.
 */
export function Contents({ items }: { items: Array<{ name: string; desc: string }> }) {
  return (
    <ul className="okryshto-brand-docs__toc">
      {items.map((item) => (
        <li key={item.name} className="okryshto-brand-docs__toc-item">
          <p className="okryshto-brand-docs__toc-name">{item.name}</p>
          <p className="okryshto-brand-docs__toc-desc">{item.desc}</p>
        </li>
      ))}
    </ul>
  );
}

/** Two-column name → meaning table, for tokens and any other keyed reference. */
export function TokenGuide({ rows }: { rows: Array<{ name: string; desc: string }> }) {
  return (
    <div>
      {rows.map((row) => (
        <div key={row.name} className="okryshto-brand-docs__token-row">
          <span className="okryshto-brand-docs__token-name">{row.name}</span>
          <span className="okryshto-brand-docs__token-desc">{row.desc}</span>
        </div>
      ))}
    </div>
  );
}

function Mark({ kind }: { kind: "do" | "dont" }) {
  return (
    <span
      className={`okryshto-brand-docs__list-mark okryshto-brand-docs__list-mark--${kind}`}
      dangerouslySetInnerHTML={{ __html: kind === "do" ? iconCheck : iconX }}
      aria-hidden
    />
  );
}

export function DoDontCard({
  title,
  subtitle,
  dos,
  donts,
}: {
  title: string;
  subtitle: string;
  dos: string[];
  donts: string[];
}) {
  return (
    <div className="okryshto-brand-docs__card">
      <h3 className="okryshto-brand-docs__card-title">{title}</h3>
      <p className="okryshto-brand-docs__card-subtitle">{subtitle}</p>
      <div className="okryshto-brand-docs__do-dont">
        <div>
          <p className="okryshto-brand-docs__card-subtitle">DO</p>
          <ul className="okryshto-brand-docs__list">
            {dos.map((item) => (
              <li key={item} className="okryshto-brand-docs__list-item">
                <Mark kind="do" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="okryshto-brand-docs__card-subtitle">DON&apos;T</p>
          <ul className="okryshto-brand-docs__list">
            {donts.map((item) => (
              <li key={item} className="okryshto-brand-docs__list-item">
                <Mark kind="dont" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function ColorSwatch({
  name,
  token,
  value,
  note,
}: {
  name: string;
  token: string;
  value: string;
  note: string;
}) {
  return (
    <article className="okryshto-brand-docs__swatch">
      <div className="okryshto-brand-docs__swatch-chip" style={{ background: `var(${token})` }} />
      <div className="okryshto-brand-docs__swatch-body">
        <p className="okryshto-brand-docs__swatch-name">{name}</p>
        <p className="okryshto-brand-docs__swatch-value">{value}</p>
        <p className="okryshto-brand-docs__swatch-note">{note}</p>
      </div>
    </article>
  );
}

export function TypeRow({
  label,
  size,
  lineHeight,
  weight,
  sample = "The quiet details make the whole",
}: {
  label: string;
  size: string;
  lineHeight: string;
  weight: string;
  sample?: string;
}) {
  const style: CSSProperties = {
    fontSize: size,
    lineHeight,
    fontWeight: weight === "Semi Bold" ? 600 : weight === "Medium" ? 500 : 400,
    letterSpacing: Number.parseFloat(size) >= 34 ? "-0.02em" : undefined,
  };

  return (
    <div className="okryshto-brand-docs__type-row">
      <p className="okryshto-brand-docs__type-sample" style={style}>
        {sample}
      </p>
      <p className="okryshto-brand-docs__type-meta">
        {label} · {size.replace("px", "")}/{lineHeight.replace("px", "")} · {weight}
      </p>
    </div>
  );
}
