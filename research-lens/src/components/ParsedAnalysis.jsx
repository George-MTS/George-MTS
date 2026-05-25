// Renders a raw AI text response with basic formatting
export default function ParsedAnalysis({ raw }) {
  if (!raw) return null;

  const lines = raw.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    // Section headers (ALL_CAPS_LABEL: or ## Header)
    if (/^#{1,3}\s/.test(line)) {
      elements.push(
        <h4 key={i} className="text-sm font-semibold text-teal-400 mt-5 mb-2 uppercase tracking-wide">
          {line.replace(/^#{1,3}\s/, '')}
        </h4>
      );
      i++;
      continue;
    }

    if (/^[A-Z_]{3,}[\s_]*:/.test(line)) {
      const [label, ...rest] = line.split(':');
      const content = rest.join(':').trim();
      elements.push(
        <div key={i} className="mt-4">
          <h4 className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">
            {label.replace(/_/g, ' ')}
          </h4>
          {content && <p className="text-sm text-slate-300 leading-relaxed">{content}</p>}
        </div>
      );
      i++;
      continue;
    }

    // Bullet points
    if (/^[-•*]\s/.test(line)) {
      const bullets = [];
      while (i < lines.length && /^[-•*]\s/.test(lines[i])) {
        bullets.push(lines[i].replace(/^[-•*]\s/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="space-y-1.5 my-2">
          {bullets.map((b, bi) => (
            <li key={bi} className="flex gap-2 text-sm text-slate-300 leading-relaxed">
              <span className="text-teal-500 flex-shrink-0 mt-0.5">•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-sm text-slate-300 leading-relaxed my-1">
        {line}
      </p>
    );
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}
