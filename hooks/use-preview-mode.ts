"use client";

import { useEffect, useState } from "react";

export function usePreviewMode(): boolean {
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    const updatePreviewMode = () => {
      setIsPreviewMode(new URLSearchParams(window.location.search).get("preview") === "1");
    };

    updatePreviewMode();
    window.addEventListener("popstate", updatePreviewMode);
    return () => window.removeEventListener("popstate", updatePreviewMode);
  }, []);

  return isPreviewMode;
}
