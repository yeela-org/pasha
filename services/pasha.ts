export async function callAgentService(payload: object):<any> {
  const url = "https://dummy-pr-agent.com/api/review";

  console.debug("Sending payload to agent:", payload);

  try {
    // TODO - yeela: fix this
    const response = fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "text"
      }
    });

    if (!response.ok) {
      const errorText = response.text();
      throw new Error(`Request failed with status ${response.status}: ${errorText}`);
    }

    const data = response.json();
    return data;
  } catch (error) {
    console.error("Failed to call agent service:", error);
    throw error;
  }
}
