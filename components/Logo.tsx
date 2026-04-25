import Image from 'next/image';

export default function Logo() {
  return (
    <div className="flex justify-center mb-8">
      <Image
        src="/sopranos-logo.png"
        alt="The Sopranos"
        width={420}
        height={120}
        priority
        className="w-auto h-[80px] md:h-[100px]"
      />
    </div>
  );
}
