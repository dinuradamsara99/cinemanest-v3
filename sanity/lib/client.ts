import { createClient, type ClientConfig } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

// Configuration with enhanced error handling
const baseConfig: ClientConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
  stega: {
    enabled: false,
  },
};

// Read-only client for fetching data
export const client = createClient(baseConfig);

// Write client for mutations (used in Studio actions)
export const writeClient = createClient({
  ...baseConfig,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});
