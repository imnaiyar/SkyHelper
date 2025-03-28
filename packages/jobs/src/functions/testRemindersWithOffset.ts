import { DateTime } from "luxon";
import { SkytimesUtils } from "@skyhelperbot/utils";

export async function checkAndExecuteEvents() {
  const now = DateTime.now().setZone("America/Los_Angeles");

  const previousMinute = now.minus({ seconds: 30 });

  const eventDetails = SkytimesUtils.allEventDetails();

  for (const [eventKey, details] of eventDetails) {
    const offset = await getOffsetFromDatabase(eventKey); // Fetch stored offset
    const { nextOccurence, status } = details;

    // bounds to account for interval drifts
    const lowerBound = now.minus({ seconds: 15 });
    const upperBound = now.plus({ seconds: 15 });
    const offsetted = nextOccurence.minus({ minutes: offset }).toMillis();
    // Offset-based reminder
    if (offsetted >= lowerBound.toMillis() && offsetted <= upperBound.toMillis()) {
      console.log(nextOccurence.toMillis() - Date.now());
      executeAction(eventKey, details, `Offset-based Reminder (Offset: ${offset} min)`);
    }

    // 0-offset (Trigger when event becomes active)
    if (offset === 0 && status.active && previousMinute < status.startTime! && now >= status.startTime!) {
      executeAction(eventKey, details, "Event Just Became Active");
    }
  }
}

function executeAction(eventKey: string, details: EventDetails, reason: string) {
  console.log(`[${DateTime.now().toISO()}] Executing action for event: ${eventKey} - ${reason}`);
  // Add action logic (e.g., send reminder)
}

// Mock function to fetch offset from database
async function getOffsetFromDatabase(eventKey: string): Promise<number> {
  return 9; // Replace with actual DB call
}
