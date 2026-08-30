export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { image, mimeType, prompt } = req.body || {};

    if (!image) {
      return res.status(400).json({
        error: "Image is required"
      });
    }

    if (!mimeType || !mimeType.startsWith("image/")) {
      return res.status(400).json({
        error: "Only image files are supported"
      });
    }

    const imageUrl = `data:${mimeType};base64,${image}`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "qwen/qwen3.6-27b",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt || "Explain this image in simple Hinglish."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageUrl
                  }
                }
              ]
            }
          ],
          temperature: 0.7,
          max_completion_tokens: 1000
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq Vision error:", data);

      return res.status(500).json({
        error: "Image AI service error"
      });
    }

    const answer =
      data?.choices?.[0]?.message?.content ||
      "Sorry, I could not understand this image.";

    return res.status(200).json({
      answer
    });

  } catch (error) {
    console.error("Vision server error:", error);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
}
