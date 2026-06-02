"use client";

import Image from "next/image";
import { UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";

type ProfileAvatarProps = {
  name: string;
  src?: string;
  className?: string;
};

function isUsableAvatarSrc(src?: string) {
  return Boolean(src && /^(https?:\/\/|blob:|data:image\/)/.test(src));
}

export function ProfileAvatar({ name, src, className }: ProfileAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const canShowImage = isUsableAvatarSrc(src) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  if (canShowImage && src) {
    return (
      <div className={cn("relative h-10 w-10 overflow-hidden rounded-full border-2 border-primary dark:border-primary-soft", className)}>
        <Image alt={name} fill sizes="40px" className="object-cover" src={src} unoptimized onError={() => setImageFailed(true)} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid h-10 w-10 place-items-center overflow-hidden rounded-full border-2 border-primary bg-secondary-soft font-display text-sm font-extrabold text-secondary dark:border-primary-soft",
        className,
      )}
    >
      <UserRound className="h-[48%] w-[48%]" />
    </div>
  );
}
