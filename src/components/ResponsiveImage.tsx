import { useEffect, useState } from "react";
import "./ResponsiveImage.css";

export const IMAGE_PLACEHOLDER =
  `${import.meta.env.BASE_URL}images/building-placeholder.svg`;

interface Props {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
}

export default function ResponsiveImage({
  src,
  alt,
  className = "",
  width,
  height,
  loading = "lazy",
}: Props) {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={`responsive-image ${className}`.trim()}
      width={width}
      height={height}
      loading={loading}
      onError={() => {
        if (imgSrc !== IMAGE_PLACEHOLDER) setImgSrc(IMAGE_PLACEHOLDER);
      }}
    />
  );
}
