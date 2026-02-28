import { useEffect } from "react";

export default function ChatWidget() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
    script.type = "text/javascript";
    script.async = true;

    script.onload = () => {
      window.voiceflow.chat.load({
        verify: { projectID: "69a217721b9e69f46669c94b" },
        url: "https://general-runtime.voiceflow.com",
        versionID: "production",
        voice: {
          url: "https://runtime-api.voiceflow.com"
        }
      });
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}