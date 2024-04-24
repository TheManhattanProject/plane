import React from "react";
import { generateHTML, JSONContent } from "@tiptap/core";
import { CoreEditorExtensionsWithoutProps } from "src/ui/extensions/core-without-props";

export const useOutputGenerator = (json: JSONContent | undefined) => {
  if (!json) {
    return "";
  }

  let output = "";
  try {
    const extensions = CoreEditorExtensionsWithoutProps();
    output = generateHTML(json, extensions);
  } catch (error) {
    console.error("Error generating HTML:", error);
  }

  return output;
};
