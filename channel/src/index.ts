import express, { Request, Response } from "express";
import expressWs, { Application } from "express-ws";
import { Server } from "@hocuspocus/server";
import { TiptapTransformer } from "@hocuspocus/transformer";
import { Database } from "@hocuspocus/extension-database";
import { Logger } from "@hocuspocus/extension-logger";
import { generateJSON } from "@tiptap/html";
import { CoreEditorExtensionsWithoutProps } from "@plane/editor-core/lib";
import * as Y from "yjs";

async function updateById(
  workspaceSlug: string,
  projectId: string,
  pageId: string,
  data: Uint8Array
) {
  const accessToken =
    "";

  const baseURL = "http://127.0.0.1:8000"; // Adjust the base URL as needed
  const url = `${baseURL}/api/workspaces/${workspaceSlug}/projects/${projectId}/pages/${pageId}/description/`;

  // const base64Data = bufferToBase64(data);

  console.log("----------------------", data);

  const formData = new FormData();
  formData.append("description_yjs", new Blob([data]));

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text(); // Attempt to read the response text
      console.log("errorBody", errorBody);
      try {
        const errorJson = JSON.parse(errorBody); // Try to parse it as JSON
        console.error(
          `HTTP error! Status: ${response.status}, Body:`,
          errorJson
        );
      } catch {
        console.error(
          `HTTP error! Status: ${response.status}, Body: ${errorBody}`
        );
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Update error:", error);
    throw error;
  }
}

async function fetchById(
  workspaceSlug: string,
  projectId: string,
  pageId: string
) {
  const baseURL = "http://localhost:8000";
  // const accessToken =
  //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzE0NzM5MzEyLCJpYXQiOjE3MTIxNDczMTIsImp0aSI6IjU3MjY0MmFiMTBkMTQyYWFiNjBmN2FjYzQ4NjdiZmJjIiwidXNlcl9pZCI6IjM0YTRjMzgxLTg5NzctNGM4MC1iMjZjLTNhZGZkMzU2YjI4MSJ9.PvvSWBDTyOv80oa5gEBOkvXuVYYeGaNmwnFqR_H2FuM"; // Replace with your actual access token retrieval logic

  const accessToken =
    "";

  const url = `${baseURL}/api/workspaces/${workspaceSlug}/projects/${projectId}/pages/${pageId}/`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text(); // Attempt to read the response text
      try {
        const errorJson = JSON.parse(errorBody); // Try to parse it as JSON
        console.error(
          `HTTP error! Status: ${response.status}, Body:`,
          errorJson
        );
      } catch {
        // If it's not JSON or not parsable, log the text directly
        console.error(
          `HTTP error! Status: ${response.status}, Body: ${errorBody}`
        );
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const ans = await response.json();

    const final = generateJSON(
      ans.description_html,
      CoreEditorExtensionsWithoutProps()
    );

    return final;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

const server = Server.configure({
  extensions: [
    new Logger(),
    new Database({
      fetch: async (data) => {
        console.log(data);
        return new Promise(async (resolve) => {
          const dataAfterFetch = await fetchById(
            "image-tes",
            "205c36c8-f9a5-47bc-8a80-d8fbc7800f6a",
            "d43e838c-b683-4538-acaa-67fdb9f9639e",
          );

          const finalDataInYdoc = TiptapTransformer.toYdoc(dataAfterFetch);
          const encodedData = Y.encodeStateAsUpdate(finalDataInYdoc);
          console.log("(anon#(anon) finalDataInYdoc: %s", encodedData); // __AUTO_GENERATED_PRINT_VAR_END__
          resolve(encodedData);
        });
      },
      store: async ({ state }) => {
        Y.logUpdate(state);
        return new Promise(async () => {
          console.log("state", state);
          // const ydoc = new Y.Doc();
          // // Assuming `state` is a Buffer or Uint8Array containing the updates
          // Y.applyUpdate(ydoc, state);
          // // Now encode the updated Y.Doc state
          // const encodedState = Y.encodeStateAsUpdate(ydoc);
          const res = await updateById(
            "image-tes",
            "205c36c8-f9a5-47bc-8a80-d8fbc7800f6a",
            "d43e838c-b683-4538-acaa-67fdb9f9639e"
            // encodedState,
          );
          console.log(res);
        });
      },
    }),
  ],
});
const { app }: { app: Application } = expressWs(express());

app.get("/", (_request: Request, response: Response) => {
  response.send("Hello World!");
});

app.ws("/collaboration", (websocket, request: Request) => {
  const context = {
    user: {
      id: 1234,
      name: "Jane",
    },
  };

  server.handleConnection(websocket, request, context);
});

app.listen(1234, () => console.log("Listening on http://127.0.0.1:1234"));
