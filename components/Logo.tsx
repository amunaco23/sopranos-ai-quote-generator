import Image from 'next/image';

export default function Logo() {
  return (
    <div className="flex flex-col items-center mb-8">
      <Image
        src="/sopranos-logo.png"
        alt="The Sopranos"
        width={420}
        height={120}
        priority
        className="w-auto h-[80px] md:h-[100px]"
      />
      <p className="text-[#555555] text-[10px] tracking-[0.35em] uppercase mt-2">
        AI Quote Generator
      </p>
    </div>
  );
}
