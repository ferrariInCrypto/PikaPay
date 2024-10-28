import * as jdenticon from "jdenticon";

type Props = {
  address: string;
  size: number;
  className?: string;
  onClick?: () => void;
};

export function Identicon({ address, size, className, onClick }: Props) {
  const icon = jdenticon.toSvg(address, size, { padding: 0 });

  if (!address || !icon) return null;

  return (
    <div
      className={`w-[${size}px] h-[${size}px] cursor-pointer ${className}`}
      onClick={onClick}
    >
      <img
        alt={"Identicon"}
        className="rounded-full"
        src={`data:image/svg+xml;utf8,${encodeURIComponent(icon)}`}
      />
    </div>
  );
}
