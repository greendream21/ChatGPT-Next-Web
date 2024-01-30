import { Mistral, REQUEST_TIMEOUT_MS } from "@/app/constant";
import { ChatOptions, getHeaders, LLMApi, LLMModel, LLMUsage } from "../api";
import { useAccessStore, useAppConfig, useChatStore } from "@/app/store";
import {
  EventStreamContentType,
  fetchEventSource,
} from "@fortaine/fetch-event-source";
import { prettyObject } from "@/app/utils/format";
import { getClientConfig } from "@/app/config/client";
import Locale from "../../locales";
import { getServerSideConfig } from "@/app/config/server";
import de from "@/app/locales/de";
import MistralClient from "@mistralai/mistralai";
import { getEncoding } from "js-tiktoken";
import axios from "axios";

export class MistralMediumApi implements LLMApi {
  extractMessage(res: any) {
    console.log("[Response] mistral-medium response: ", res);

    return (
      res?.candidates?.at(0)?.content?.parts.at(0)?.text ||
      res?.error?.message ||
      ""
    );
  }
  async chat(options: ChatOptions): Promise<void> {
    const apiClient = this;
    const messages = options.messages.map((v) => ({
      role: v.role.replace("assistant", "model").replace("system", "user"),
      parts: [{ text: v.content }],
    }));

    // mistral requires that role in neighboring messages must not be the same
    for (let i = 0; i < messages.length - 1; ) {
      // Check if current and next item both have the role "model"
      if (messages[i].role === messages[i + 1].role) {
        // Concatenate the 'parts' of the current and next item
        messages[i].parts = messages[i].parts.concat(messages[i + 1].parts);
        // Remove the next item
        messages.splice(i + 1, 1);
      } else {
        // Move to the next item
        i++;
      }
    }

    const messageItem = {
      model: "mistral-tiny",
      messages: [
        {
          role: "user",
          content: messages[messages.length - 1].parts[0].text,
        },
      ],
    };

    const modelConfig = {
      ...useAppConfig.getState().modelConfig,
      ...useChatStore.getState().currentSession().mask.modelConfig,
      ...{
        model: options.config.model,
      },
    };

    const session = useChatStore.getState().currentSession();

    const requestPayload = {
      contents: messageItem,
    };

    console.log("[Request] mistral payload: ", requestPayload);

    const shouldStream = !!options.config.stream;
    const controller = new AbortController();
    options.onController?.(controller);

    let streamedResponse = "";

    const accessStore = useAccessStore.getState();

    const apikey = accessStore.mistralApiKey;

    const client = new MistralClient(apikey);

    const chatStreamResponse = await client.chatStream(messageItem);

    const setLog = async (msg: any) => {
      const encoding = getEncoding("cl100k_base");

      const tokens = encoding.encode(msg);

      const model = session.mask.modelConfig.model;
      const email = session.stat.email;
      const token = tokens.length;

      try {
        const logData = {
          email,
          model,
          token,
          methods: "output",
        };

        await axios.post("/api/usage", logData);
      } catch (error) {
        console.error(error);
      }
    };

    for await (const chunk of chatStreamResponse) {
      if (chunk.choices[0].delta.content !== undefined) {
        const streamText = chunk.choices[0].delta.content;

        streamedResponse += streamText;
      }
      options.onFinish(streamedResponse);
    }

    setLog(streamedResponse);

    // try {
    //   const chatPath = this.path(Mistral.ChatPath);
    //   const chatPayload = {
    //     method: "POST",
    //     body: JSON.stringify(requestPayload),
    //     signal: controller.signal,
    //     headers: getHeaders(),
    //   };

    //   // make a fetch request
    //   const requestTimeoutId = setTimeout(
    //     () => controller.abort(),
    //     REQUEST_TIMEOUT_MS,
    //   );
    //   if (shouldStream) {
    //     let responseText = "";
    //     let remainText = "";
    //     let streamChatPath = chatPath.replace(
    //       "generateContent",
    //       "streamGenerateContent",
    //     );
    //     let finished = false;

    //     let existingTexts: string[] = [];
    //     const finish = () => {
    //       finished = true;
    //       options.onFinish(existingTexts.join(""));
    //     };

    //     // animate response to make it looks smooth
    //     function animateResponseText() {
    //       if (finished || controller.signal.aborted) {
    //         responseText += remainText;
    //         finish();
    //         return;
    //       }

    //       if (remainText.length > 0) {
    //         const fetchCount = Math.max(1, Math.round(remainText.length / 60));
    //         const fetchText = remainText.slice(0, fetchCount);
    //         responseText += fetchText;
    //         remainText = remainText.slice(fetchCount);
    //         options.onUpdate?.(responseText, fetchText);
    //       }

    //       requestAnimationFrame(animateResponseText);
    //     }

    //     // start animaion
    //     animateResponseText();

    //     fetch(chatPath, chatPayload)
    //       .then((response) => {
    //         console.log("response", response);

    //         const reader = response?.body?.getReader();
    //         const decoder = new TextDecoder();
    //         let partialData = "";

    //         return reader?.read().then(function processText({
    //           done,
    //           value,
    //         }): Promise<any> {
    //           if (done) {
    //             console.log("Stream complete");
    //             // options.onFinish(responseText + remainText);
    //             finished = true;
    //             return Promise.resolve();
    //           }

    //           partialData += decoder.decode(value, { stream: true });

    //           try {
    //             let data = JSON.parse(ensureProperEnding(partialData));

    //             const textArray = data.reduce(
    //               (acc: string[], item: { candidates: any[] }) => {
    //                 const texts = item.candidates.map((candidate) =>
    //                   candidate.content.parts
    //                     .map((part: { text: any }) => part.text)
    //                     .join(""),
    //                 );
    //                 return acc.concat(texts);
    //               },
    //               [],
    //             );

    //             if (textArray.length > existingTexts.length) {
    //               const deltaArray = textArray.slice(existingTexts.length);
    //               existingTexts = textArray;
    //               remainText += deltaArray.join("");
    //             }
    //           } catch (error) {
    //             // console.log("[Response Animation] error: ", error,partialData);
    //             // skip error message when parsing json
    //           }

    //           return reader.read().then(processText);
    //         });
    //       })
    //       .catch((error) => {
    //         console.error("Error:", error);
    //       });
    //   } else {
    //     const res = await fetch(chatPath, chatPayload);
    //     clearTimeout(requestTimeoutId);

    //     const resJson = await res.json();

    //     if (resJson?.promptFeedback?.blockReason) {
    //       // being blocked
    //       options.onError?.(
    //         new Error(
    //           "Message is being blocked for reason: " +
    //             resJson.promptFeedback.blockReason,
    //         ),
    //       );
    //     }
    //     const message = this.extractMessage(resJson);
    //     options.onFinish(message);
    //   }
    // } catch (e) {
    //   console.log("[Request] failed to make a chat request", e);
    //   options.onError?.(e as Error);
    // }
  }
  usage(): Promise<LLMUsage> {
    throw new Error("Method not implemented.");
  }
  async models(): Promise<LLMModel[]> {
    return [];
  }
  path(path: string): string {
    return "/api/mistral/" + path;
  }
}

function ensureProperEnding(str: string) {
  if (str.startsWith("[") && !str.endsWith("]")) {
    return str + "]";
  }
  return str;
}
