import { YoutubeIcon } from "lucide-react";

import {
  TypographyH2,
  TypographyP,
  TypographySmall,
} from "@/components/typography";

export default function What() {
  return (
    <div className="w-2/3">
      <TypographyH2 border={false}>youtube videos</TypographyH2>
      <TypographyP>
        This section is a bit empty right now, i know. I&apos;m planning to
        start making videos about software development, lifestyle, life in
        general and other things that i find interesting. Keep an eye on this
        page 🤓
        <br />
        <TypographySmall>
          Pssst, you can subscribe to my channel{" "}
          <a
            href="https://youtube.com/@imjustlucas"
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            right here
          </a>
        </TypographySmall>
      </TypographyP>
    </div>
  );
}
