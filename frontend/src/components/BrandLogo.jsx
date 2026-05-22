import { Link } from "react-router-dom";
import { LOGO_SRC } from "../config/brand";

export function BrandLogo({ asLink = true, size, className = "" }) {
  const useCssSize = className.includes("detect-brand--navbar");
  const img = (
    <img
      src={LOGO_SRC}
      alt="Home"
      className="detect-logo"
      height={useCssSize ? undefined : size ?? 40}
      width="auto"
    />
  );

  if (asLink) {
    return (
      <Link to="/" className={`detect-brand ${className}`.trim()}>
        {img}
      </Link>
    );
  }

  return <div className={`detect-brand ${className}`.trim()}>{img}</div>;
}
