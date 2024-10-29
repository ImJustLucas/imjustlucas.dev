import { Bold, TypographyH2, TypographyP } from "@/components/typography";

export default function Home() {
  return (
    <div className="w-2/3">
      <TypographyH2 border={false}>Who am i?</TypographyH2>
      <TypographyP>
        Yoooo, I&apos;m <Bold>Lucas</Bold>! <br />A french software developer
        based in the heart of Paris, France, with a focus on crafting
        high-quality websites and applications.
      </TypographyP>
    </div>
  );
}
