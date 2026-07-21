import { toBlob, toPng } from "html-to-image";

export async function shareResultsImage(options: {
  element: HTMLElement;
  fileName: string;
  title: string;
  text: string;
}): Promise<"shared" | "downloaded"> {
  const { element, fileName, title, text } = options;

  // Wait a frame so layout/fonts settle before capture
  await new Promise((r) => requestAnimationFrame(() => r(null)));

  const blob = await toBlob(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#eef1f4",
    filter: (node) => {
      if (!(node instanceof HTMLElement)) return true;
      return !node.dataset.shareIgnore;
    },
  });

  if (!blob) {
    throw new Error("Could not create the results image.");
  }

  const file = new File([blob], fileName, { type: "image/png" });

  const canShareFiles =
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] });

  if (canShareFiles) {
    try {
      await navigator.share({
        files: [file],
        title,
        text,
      });
      return "shared";
    } catch (err) {
      // User cancelled share sheet — not an error for us
      if (err instanceof Error && err.name === "AbortError") {
        return "shared";
      }
    }
  }

  // Fallback: download PNG so they can send it on WhatsApp manually
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#eef1f4",
    filter: (node) => {
      if (!(node instanceof HTMLElement)) return true;
      return !node.dataset.shareIgnore;
    },
  });

  const link = document.createElement("a");
  link.download = fileName;
  link.href = dataUrl;
  link.click();

  // Also open WhatsApp with a short caption
  const wa = `https://wa.me/?text=${encodeURIComponent(
    `${text}\n\n(Attach the downloaded score picture so it's easy to read.)`,
  )}`;
  window.open(wa, "_blank", "noopener,noreferrer");

  return "downloaded";
}
