"use client";

import React, { useEffect, useState } from "react";
import { getNameInitials } from "@/lib/utils";
import { resolveDisplayPhotoUrl } from "@/lib/photoUpload";

interface PhotoAvatarProps {
  photoUrl?: string | null;
  photo?: string | null;
  name: string;
  imgClassName?: string;
  fallbackClassName?: string;
  fallbackLabel?: string;
}

/**
 * Displays a Student or Teacher photo when a valid URL is available and loads cleanly;
 * otherwise renders the initials placeholder without showing a broken image icon.
 */
export const PhotoAvatar: React.FC<PhotoAvatarProps> = ({
  photoUrl,
  photo,
  name,
  imgClassName = "w-10 h-10 rounded-full object-cover border border-royal-200 shadow-sm flex-shrink-0",
  fallbackClassName = "w-10 h-10 rounded-full bg-royal-100 text-royal-800 border border-royal-200 font-extrabold flex items-center justify-center text-xs tracking-wider shadow-sm flex-shrink-0",
  fallbackLabel,
}) => {
  const src = resolveDisplayPhotoUrl({ photoUrl, photo });
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={name}
        className={imgClassName}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <div className={fallbackClassName}>
      {fallbackLabel || getNameInitials(name)}
    </div>
  );
};

export default PhotoAvatar;
