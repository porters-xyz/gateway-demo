import { PrismaClient } from "../../web-portal/backend/.generated/client";

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.ruleType.createMany({
      data: [
        {
          name: "Allowed Origins",
          isEditable: true,
          isMultiple: true,
          validationType: "regex",
          validationValue: `https?://(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()!@:%_+.~#?&/\\//=]*)`,
        },
        {
          name: "Approved Chains",
          isEditable: true,
          isMultiple: true,
          validationType: "function",
          validationValue: "Array.isArray(value)",
        },
        {
          name: "Secret Key",
          isEditable: false,
          isMultiple: false,
          validationType: "function",
          validationValue: 'typeof value === "string" && value.length === 32',
        },
        {
          name: "Allowed UserAgents",
          isEditable: true,
          isMultiple: true,
          validationType: "regex",
          validationValue: "*", // <-- @note: this is a placeholder, since I couldnt find a regex for this
        },
      ],
    });
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
