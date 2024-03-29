import { PrismaClient } from "../../web-portal/backend/.generated/client";

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.ruleType.createMany({
      data: [
        {
          name: "Allowed Origins",
          description: "Allows you to limit app urls that can make requests",
          isEditable: true,
          isMultiple: true,
          validationType: "regex",
          validationValue: `https?://(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()!@:%_+.~#?&/\\//=]*)`,
        },
        {
          name: "Approved Chains",
          description:
            "Allows you to limit chains that can be access via this App",
          isEditable: true,
          isMultiple: true,
          validationType: "function",
          validationValue: "Array.isArray(value)",
        },
        {
          name: "Secret Key",
          description:
            "Allows you to add extra layer of security to avoid misusage by others",
          isEditable: false,
          isMultiple: false,
          validationType: "function",
          validationValue: 'typeof value === "string" && value.length === 32',
        },
        {
          name: "Allowed UserAgents",
          description:
            "Allows you to limit type of clients that can use this app",
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
