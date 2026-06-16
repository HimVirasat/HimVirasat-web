interface BackgroundDecorProps {
  imageSrc?: string;
}

export function BackgroundDecor({
  imageSrc = "/mountains1.png",
}: BackgroundDecorProps) {
  return (
    <>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${imageSrc}')` }}
      />
      <div className="absolute inset-0 bg-white/60 dark:bg-black/85" />
    </>
  );
}
