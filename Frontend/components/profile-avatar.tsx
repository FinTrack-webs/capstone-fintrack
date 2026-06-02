import Image from "next/image";
import { cn } from "@/utils/cn";

type ProfileAvatarProps = {
  name: string;
  src?: string;
  className?: string;
};

export function ProfileAvatar({ name, src, className }: ProfileAvatarProps) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <div className={cn("relative h-10 w-10 overflow-hidden rounded-full border-2 border-primary", className)}>
        <Image alt={name} fill sizes="40px" className="object-cover" src={src} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid h-10 w-10 place-items-center rounded-full border-2 border-primary bg-secondary-soft font-display text-sm font-extrabold text-secondary",
        className,
      )}
    >
      {initials}
    </div>
  );
}
