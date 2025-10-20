import type { SkyHelper } from "@/structures";
import {
  calculateUserProgress,
  enrichDataWithUserProgress,
  formatCurrencies,
  formatUnlockedItems,
  getSkyGamePlannerData,
  PlannerDataHelper,
} from "@skyhelperbot/constants/skygame-planner";
import { container, generatePlannerProfileCard, mediaGallery, mediaGalleryItem, textDisplay } from "@skyhelperbot/utils";
import type { APIUser } from "discord-api-types/v10";

export async function plannerProfile(tab: string, user: APIUser, client: SkyHelper) {
  if (tab !== "profile") return;
  const settings = await client.schemas.getUser(user);
  const data = await getSkyGamePlannerData();
  const enriched = enrichDataWithUserProgress(data);
  const plannerData = settings.plannerData ?? PlannerDataHelper.createEmpty();
  const currencies = formatCurrencies(enriched, plannerData);

  const unlocked = formatUnlockedItems(enriched);
  const profilecard = await generatePlannerProfileCard({
    botIcon: client.utils.getUserAvatar(client.user),
    botName: client.user.username,
    user,
    currencies: plannerData.currencies,
    progress: calculateUserProgress(enriched),
  });

  return {
    components: [
      container(
        textDisplay("# User Stats", "You Have:", currencies, unlocked),
        mediaGallery(mediaGalleryItem("attachment://profile.png")),
      ),
    ],
    files: [{ name: "profile.png", data: profilecard }],
  };
}
