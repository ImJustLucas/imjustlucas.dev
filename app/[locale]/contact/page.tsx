import { FriendRequest } from "@/components/contact/FriendRequest";
import { PageHeader, routeMetadata } from "@/components/page-header";
import { ROUTES } from "@/config/routes";
import { getLevel, getProfile } from "@/lib/content/server";

// Lucas's Level beside his name, from his GitHub Contributions: regenerated
// every hour like the home page, and on every deploy. Static, as the
// uncached GitHub fetch would otherwise make it dynamic.
export const dynamic = "force-static";
export const revalidate = 3600;

export const generateMetadata = routeMetadata(ROUTES.contact);

/** The add-friend screen: a LinkedIn DM first, then Discord and the rest. */
export default async function Contact() {
  const [{ links, discordUserId }, level] = await Promise.all([
    getProfile(),
    getLevel(),
  ]);

  return (
    // From 768px the request sits in the middle of the panel, like a window
    // the client opens (the panel's height less its 12px frame and 28px
    // padding, top and bottom)
    <div className="mx-auto max-w-[880px] md:flex md:min-h-[calc(100dvh-80px)] md:flex-col md:justify-center md:pb-[6vh]">
      <PageHeader route={ROUTES.contact} />
      <FriendRequest
        links={links}
        discordUserId={discordUserId}
        level={level && { level: level.level, xp: level.xp }}
      />
    </div>
  );
}
