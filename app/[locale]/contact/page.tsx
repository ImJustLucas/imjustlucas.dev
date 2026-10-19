import { PageHeader, routeMetadata } from "@/components/page-header";
import { TypographyH3, TypographyP } from "@/components/typography";
import { ROUTES } from "@/config/routes";
import { getProfile } from "@/lib/content/server";

export const generateMetadata = routeMetadata(ROUTES.contact);

export default async function Contact() {
  const { links } = await getProfile();
  const linkedin = (label: string) => (
    <a
      href={links.linkedin}
      target="_blank"
      rel="noopener noreferrer"
      className="underline"
    >
      {label}
    </a>
  );

  return (
    <div className="md:w-2/3 w-full">
      <PageHeader route={ROUTES.contact} />
      <TypographyP>
        If you want to contact me, you can do so via my {linkedin("LinkedIn")}{" "}
        DMs, I will respond as quickly as possible
      </TypographyP>
      <TypographyH3>Inspiration</TypographyH3>
      <TypographyP>
        The design is not mine basically, it is largely inspired by the sites of{" "}
        <a
          href="https://github.com/phineas/phineas.io"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          phineas
        </a>{" "}
        &{" "}
        <a
          href="https://antoinek.fr"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          antoinek
        </a>
        , big s/o to them
      </TypographyP>
      <TypographyH3>VIE</TypographyH3>
      <TypographyP>
        🇬🇧 If international recruiters come through here, I&apos;m looking of a
        VIE for September 2025 do not hesitate to{" "}
        {linkedin("send me a message")}
        <br />
        🇫🇷 Si des recruteurs internationaux passent par ici, je recherche un VIE
        pour septembre 2025 ! N&apos;hésitez pas à{" "}
        {linkedin("m'envoyer un message")}
      </TypographyP>
      <TypographyP>Preferred destination:</TypographyP>
      <ol className="list-decimal pl-6">
        <li>North America</li>
        <li>Asia (Japan, South Korea)</li>
        <li>Oceania (Australia, New Zealand)</li>
      </ol>
    </div>
  );
}
