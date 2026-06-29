"use client";

import { useEffect } from "react";

export function GoalsDebugLoader() {
  useEffect(() => {
    async function loadGoals() {
      const response = await fetch("/api/goals");

      if (!response.ok) {
        console.error(
          "Failed to load goals:",
          response.status,
          response.statusText,
        );
        return;
      }

      const data = await response.json();
      console.log("Goals:", data.goals);
    }

    void loadGoals();
  }, []);

  return null;
}
