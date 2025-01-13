// runs on cloudflare workers

interface Env {
  SENDGRID_API_KEY: string;
  CONTACT_FORM_TO_EMAIL: string;
}

interface ContactFormData {
  email: string;
  message: string;
  "help-type": string;
  "help-type-label": string;
  "org-url"?: string;
  website?: string; // honeypot field
  "form-start-time"?: string; // timestamp field
}

function isSpam(formData: ContactFormData): {
  isSpam: boolean;
  reason?: string;
} {
  // Check honeypot field
  if (formData.website && formData.website.length > 0) {
    return { isSpam: true, reason: "Honeypot field was filled" };
  }

  // Check submission timing (minimum 3 seconds)
  const startTime = parseInt(formData["form-start-time"] || "0");
  const submissionTime = Date.now();
  const timeDiff = submissionTime - startTime;
  if (timeDiff < 3000) {
    // 3 seconds
    return { isSpam: true, reason: "Form submitted too quickly" };
  }

  // Check for suspicious patterns in message
  const suspiciousPatterns = [
    /<[^>]*>/, // HTML tags
    /\[url=.*?\].*?\[\/url\]/, // BBCode
    /(http|https):\/\/[^\s]*/g, // URLs
    /\b(viagra|casino|porn|xxx|sex)\b/i, // Common spam keywords
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(formData.message)) {
      return { isSpam: true, reason: "Message contains suspicious content" };
    }
  }

  // Check for excessive URLs (more than 2)
  const urlCount = (formData.message.match(/(http|https):\/\/[^\s]*/g) || [])
    .length;
  if (urlCount > 2) {
    return { isSpam: true, reason: "Too many URLs in message" };
  }

  return { isSpam: false };
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    // Check required environment variables
    if (!context.env.SENDGRID_API_KEY || !context.env.CONTACT_FORM_TO_EMAIL) {
      console.error(
        "Contact form error: Missing required environment variables"
      );
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    const formData = await context.request.formData();
    const data: ContactFormData = {
      email: formData.get("email") as string,
      message: formData.get("message") as string,
      "help-type": formData.get("help-type") as string,
      "help-type-label": formData.get("help-type-label") as string,
      "org-url": formData.get("org-url") as string,
      website: formData.get("website") as string,
      "form-start-time": formData.get("form-start-time") as string,
    };

    // Validate required fields
    if (!data.email || !data.message || !data["help-type"]) {
      console.warn("Contact form rejected: Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(data.email)) {
      console.warn("Contact form rejected: Invalid email format");
      return new Response(
        JSON.stringify({ error: "Please enter a valid email address" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    // Check for spam
    const spamCheck = isSpam(data);
    if (spamCheck.isSpam) {
      console.warn("Contact form rejected: Spam detected -", spamCheck.reason);
      return new Response(
        JSON.stringify({ error: "Message flagged as spam" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    const emailData = {
      personalizations: [
        {
          to: [{ email: context.env.CONTACT_FORM_TO_EMAIL }],
          subject: `Contact Form: ${
            data["help-type-label"] || data["help-type"]
          }`,
        },
      ],
      from: { email: "noreply@operately.com", name: "Operately Contact Form" },
      reply_to: { email: data.email },
      content: [
        {
          type: "text/plain",
          value: `Type: ${data["help-type-label"] || data["help-type"]}
From: ${data.email}
Organization URL: ${data["org-url"] || "Not provided"}

Message:
${data.message}`,
        },
      ],
    };

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${context.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      console.error("Contact form error: Failed to send email via SendGrid");
      throw new Error("Failed to send email");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error(
      "Contact form error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
};
