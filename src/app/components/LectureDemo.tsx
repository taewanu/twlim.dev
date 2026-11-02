import Image from "next/image";

// The lecture is a wide, full-page interactive experience, so it does not fit a
// narrow reading column or a phone. Show a real screenshot in the column and
// link out to the live page, where it renders at its own size.
export function LectureDemo() {
  return (
    <a
      href="/skills/visual-code-lecture-demo.html"
      target="_blank"
      rel="noopener noreferrer"
      className="group block no-underline!"
    >
      <Image
        src="/skills/visual-code-lecture-demo-poster.png"
        alt="visual-code-lecture running on a token-bucket rate limiter"
        width={1200}
        height={740}
        className="w-full rounded-lg border border-[#E5E1DE]"
        loading="eager"
      />
      <span className="mt-2 inline-block text-[0.8125rem] text-muted underline decoration-[#E5E1DE] underline-offset-2 group-hover:decoration-[#9B9590]">
        Open the live, interactive version ↗
      </span>
    </a>
  );
}
