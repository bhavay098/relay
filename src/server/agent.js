import { OpenAIAgentsProvider } from "@corsair-dev/mcp";
import { Agent, run, tool } from "@openai/agents";
import { corsair } from "./corsair.js";

const openAiApiKey = process.env.OPENAI_API_KEY;
if (!openAiApiKey) {
  throw new Error("OPENAI_API_KEY is not set");
}

const provider = new OpenAIAgentsProvider();
const tools = await provider.build({ corsair, tool });

const agent = new Agent({
  name: "corsair-agent",
  model: "gpt-4.1",
  instructions:
    "You have access to Corsair tools. Use list_operations to discover available APIs, get_schema to understand required arguments, and run_script to execute them. When referencing resources (like channels), always use their ID, not their name.",
  tools,
});

const result = await run(agent, "Setup corsair, then list all Slack channels.");
console.log(result.finalOutput);
