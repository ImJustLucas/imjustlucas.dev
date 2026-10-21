import { FriendRequest } from "@/components/contact/FriendRequest";
import { PageHeader, routeMetadata } from "@/components/page-header";
import { ROUTES } from "@/config/routes";
import { getProfile } from "@/lib/content/server";

export const generateMetadata = routeMetadata(ROUTES.contact);

/** The add-friend screen: a LinkedIn DM first, then Discord and the rest. */
export default async function Contact() {
  const { links, discordUserId } = await getProfile();

  return (
    // From 768px the request sits in the middle of the panel, like a window
    // the client opens (the panel's height less its 12px frame and 28px
    // padding, top and bottom)
    <div className="mx-auto max-w-[880px] md:flex md:min-h-[calc(100dvh-80px)] md:flex-col md:justify-center md:pb-[6vh]">
      <PageHeader route={ROUTES.contact} />
      <FriendRequest links={links} discordUserId={discordUserId} />
    </div>
  );
}
