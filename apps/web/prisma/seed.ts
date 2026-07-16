import "dotenv/config";

import type { CreateGoalInput } from "../lib/goals/goal.schemas";
import { prisma } from "../lib/prisma";
import { toPrismaGoalCreateData } from "../lib/goals/to-prisma-goal";

const seedGoals: CreateGoalInput[] = [
  {
    name: "Meditate",
    description: "Daily mindfulness practice",
    category: "spiritual",
    period: "WEEK",
    type: "OCCURANCE",
    target: 5,
  },
  {
    name: "Run",
    description: "Outdoor runs or treadmill sessions",
    category: "health",
    period: "WEEK",
    type: "OCCURANCE",
    target: 3,
  },
  {
    name: "Read",
    description: "Finish books or long-form articles",
    category: "learning",
    period: "MONTH",
    type: "OCCURANCE",
    target: 2,
  },
  {
    name: "Call family",
    description: "Check in with parents and siblings",
    category: "social",
    period: "MONTH",
    type: "OCCURANCE",
    target: 4,
  },
  {
    name: "Strength training",
    description: "Gym or bodyweight workouts",
    category: "health",
    period: "WEEK",
    type: "OCCURANCE",
    target: 4,
  },
  {
    name: "Journal",
    description: "Reflect on the day in writing",
    category: "learning",
    period: "WEEK",
    type: "OCCURANCE",
    target: 7,
  },
  {
    name: "Deep work",
    description: "Focused work without distractions",
    category: "productivity",
    period: "WEEK",
    type: "TIME",
    target: "PT10H",
  },
  {
    name: "Practice guitar",
    description: "Scales, songs, and technique drills",
    category: "creative",
    period: "WEEK",
    type: "TIME",
    target: "PT3H",
  },
  {
    name: "Learn Spanish",
    description: "Lessons, apps, and conversation practice",
    category: "learning",
    period: "MONTH",
    type: "TIME",
    target: "PT20H",
  },
  {
    name: "Screen-free time",
    description: "Time away from phones, TV, and laptops",
    category: "health",
    period: "WEEK",
    type: "TIME",
    target: "PT14H",
  },
];

async function main() {
  const email = process.env.SEED_USER_EMAIL?.toLowerCase();
  const reseed = process.env.SEED_RESEED === "true";
  const user = email
    ? await prisma.user.findUnique({ where: { email } })
    : await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });

  if (!user) {
    throw new Error(
      "No user found. Sign up first or set SEED_USER_EMAIL in your environment.",
    );
  }

  const existingCount = await prisma.goal.count({ where: { userId: user.id } });

  if (existingCount > 0 && !reseed) {
    console.log(
      `User ${user.email} already has ${existingCount} goal(s). Skipping seed.`,
    );
    console.log("Set SEED_RESEED=true to delete and recreate seed goals.");
    return;
  }

  if (reseed && existingCount > 0) {
    await prisma.goal.deleteMany({ where: { userId: user.id } });
    console.log(`Deleted ${existingCount} existing goal(s) for ${user.email}.`);
  }

  await prisma.goal.createMany({
    data: seedGoals.map((goal) => {
      const createInput = toPrismaGoalCreateData(user.id, goal);

      return {
        userId: user.id,
        name: createInput.name,
        description: createInput.description,
        category: createInput.category ?? null,
        period: createInput.period,
        type: createInput.type,
        targetOccurrences: createInput.targetOccurrences ?? null,
        targetDuration: createInput.targetDuration ?? null,
        targetAmount: createInput.targetAmount ?? null,
      };
    }),
  });

  console.log(`Seeded ${seedGoals.length} goals for ${user.email}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
