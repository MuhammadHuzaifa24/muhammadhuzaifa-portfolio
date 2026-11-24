export default function SectionHeading({ number, eyebrow, title, children }) {
  return <div className="section-heading"><div><p className="eyebrow"><span>{number} /</span> {eyebrow}</p><h2>{title}</h2></div>{children && <p className="section-description">{children}</p>}</div>;
}
