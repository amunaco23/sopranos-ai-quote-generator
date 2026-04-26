import Image from 'next/image';

export default function Logo() {
  return (
    <div className="flex items-end justify-center gap-1 mb-10">
      <Image
        src="/sopranos-logo.png"
        alt="The Sopranos"
        width={400}
        height={110}
        priority
        className="w-auto h-[72px] md:h-[88px]"
      />
      <Image
        src="/AI Icon.png"
        alt="AI"
        width={52}
        height={52}
        priority
        className="w-auto h-[34px] md:h-[42px] mb-1"
      />
    </div>
  );
}
