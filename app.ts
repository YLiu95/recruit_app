 

// Note: This example assumes a Node.js environment with fetch available (Node v18+ or via an appropriate polyfill).   

// If running in an older Node.js version, install a fetch polyfill (e.g. node-fetch).   

   

const API_KEY = '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';   

   

// Modify or add your system prompt if needed.   

const systemPrompt = "You are a helpful assistant.";   

   

// Define the query you want to ask, appending it to the system prompt.   

const question = "which is bigger, 9.9 or 9.11?";   

   

async function chatCompletionWithReasoning() {   

  const url = 'https://openrouter.ai/api/v1/chat/completions';   

   

  const payload = {   

    model: 'deepseek/deepseek-r1:free',   

    messages: [   

      {   

        role: 'user',   

        content: systemPrompt + question,   

      },   

    ],   

    // Pass reasoning parameters so the API returns reasoning along with content.   

    reasoning: {   

      max_tokens: 900,   

      exclude: false,   

    },   

    max_tokens: 1024,   

    temperature: 0.6,   

    seed: 95,   

    stream: true,   

  };   

   

  const response = await fetch(url, {   

    method: 'POST',   

    headers: {   

      'Authorization': `Bearer ${API_KEY}`,   

      'Content-Type': 'application/json',   

    },   

    body: JSON.stringify(payload),   

  });   

   

  if (!response.body) {   

    throw new Error('Response body is empty');   

  }   

   

  const reader = response.body.getReader();   

  const decoder = new TextDecoder();   

  let buffer = '';   

   

  // Flags to print the prefix only once   

  let reasoningStarted = false;   

  let contentStarted = false;   

   

  try {   

    while (true) {   

      const { done, value } = await reader.read();   

      if (done) break;   

   

      // Decode the chunk and add it to our buffer   

      buffer += decoder.decode(value, { stream: true });   

   

      // Process complete lines from the buffer by searching for newline character(s)   

      let newlineIndex: number;   

      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {   

        let line = buffer.slice(0, newlineIndex).trim();   

        buffer = buffer.slice(newlineIndex + 1);   

   

        // Only process lines that start with the expected "data: " prefix   

        if (line.startsWith("data: ")) {   

          const data = line.slice(6).trim();   

          if (data === "[DONE]") {   

            return;   

          }   

          try {   

            const parsed = JSON.parse(data);   

            const delta = parsed.choices?.[0]?.delta;   

            if (delta) {   

              // Stream the reasoning text if present.   

              if (delta.reasoning) {   

                if (!reasoningStarted) {   

                  process.stdout.write("REASONING: ");   

                  reasoningStarted = true;   

                }   

                process.stdout.write(delta.reasoning);   

              }   

              // Stream the final content answer if present.   

              if (delta.content) {   

                if (!contentStarted) {   

                  process.stdout.write("\nCONTENT: ");   

                  contentStarted = true;   

                }   

                process.stdout.write(delta.content);   

              }   

            }   

          } catch (e) {   

            // Ignore incomplete JSON fragments or parsing errors.   

            continue;   

          }   

        }   

      }   

    }   

  } finally {   

    await reader.cancel();   

  }   

}   

   

chatCompletionWithReasoning().catch((error) => {   

  console.error('Error during chat streaming:', error);   

});   