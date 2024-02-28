import { useEffect, useState } from "react";
import { Prompt, SearchService, usePromptStore } from "../store/prompt";

import styles from "./prompter.module.scss";

import Locale from "../locales";

import { IconButton } from "./button";
import { nanoid } from "nanoid";

import { Input, Modal } from "./ui-lib";

import { copyToClipboard } from "../utils";

import Fuse from "fuse.js";

import AddIcon from "../icons/add.svg";
import CopyIcon from "../icons/copy.svg";
import ClearIcon from "../icons/clear.svg";
import EditIcon from "../icons/edit.svg";
import EyeIcon from "../icons/eye.svg";
import TrashIcon from "../icons/trash.svg";
import CancelIcon from "../icons/cancel.svg";
import axios from "axios";
import { useUser } from "@clerk/nextjs";

function useSteps(
  steps: Array<{
    name: string;
    value: string;
  }>,
) {
  const stepCount = steps.length;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const nextStep = () =>
    setCurrentStepIndex((currentStepIndex + 1) % stepCount);
  const prevStep = () =>
    setCurrentStepIndex((currentStepIndex - 1 + stepCount) % stepCount);

  return {
    currentStepIndex,
    setCurrentStepIndex,
    nextStep,
    prevStep,
    currentStep: steps[currentStepIndex],
  };
}

function Steps<
  T extends {
    name: string;
    value: string;
  }[],
>(props: { steps: T; onStepChange?: (index: number) => void; index: number }) {
  const steps = props.steps;
  const stepCount = steps.length;

  return (
    <div className={styles["steps"]}>
      <div className={styles["steps-progress"]}>
        <div
          className={styles["steps-progress-inner"]}
          style={{
            width: `${((props.index + 1) / stepCount) * 100}%`,
          }}
        ></div>
      </div>
      <div className={styles["steps-inner"]}>
        {steps.map((step, i) => {
          return (
            <div
              key={i}
              className={`${styles["step"]} ${
                styles[i <= props.index ? "step-finished" : ""]
              } ${i === props.index && styles["step-current"]} clickable`}
              onClick={() => {
                props.onStepChange?.(i);
              }}
              role="button"
            >
              <span className={styles["step-index"]}>{i + 1}</span>
              <span className={styles["step-name"]}>{step.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ConfirmModal(props: {
  action?: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="modal-mask">
      <Modal
        title={Locale.Settings.Prompt.Modal.Title}
        onClose={() => props.onClose?.()}
        actions={[
          <IconButton
            key="Delete"
            onClick={() => props.action?.()}
            bordered
            icon={<TrashIcon />}
            text="Delete"
          />,
          <IconButton
            key="Cancel"
            onClick={() => props.onClose?.()}
            bordered
            icon={<CancelIcon />}
            text="Cancel"
          />,
        ]}
      >
        <div className="flex justify-center items-center">
          <h2>Do you delete this folder?</h2>
        </div>
      </Modal>
    </div>
  );
}

export function UserPromptModal(props: { onClose?: () => void }) {
  const steps = [
    {
      name: Locale.Settings.Prompt.SystemPrompt,
      value: "system",
    },
    {
      name: Locale.Settings.Prompt.UserPrompt,
      value: "user",
    },
  ];
  const { currentStep, setCurrentStepIndex, currentStepIndex } =
    useSteps(steps);
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchPrompts, setSearchPrompts] = useState<Prompt[]>([]);
  const prompts = searchInput.length > 0 ? searchPrompts : allPrompts;

  const [editingPrompt, setEditingPrompt] = useState<any>();

  const [email, setEmail] = useState("");

  const { isSignedIn, user, isLoaded } = useUser();

  const getUserData = () => {
    if (!isLoaded) {
      return null;
    }

    if (isSignedIn) {
      const email = user.emailAddresses[0].emailAddress;
      setEmail(email);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  const getPrompt = async () => {
    try {
      const { data } = await axios.get("/api/prompt");

      setAllPrompts(data);
    } catch (error) {
      console.error("Errors: ", error);
    }
  };

  const deletePrompt = async (id: any) => {
    try {
      if (!id) {
        getPrompt();
        return;
      }

      await axios.delete("/api/prompt", { data: { id } });
      getPrompt();
    } catch (error) {
      console.error("Errors: ", error);
    }
  };

  const searchPrompt = (data: any) => {
    const fuse = new Fuse(allPrompts, {
      keys: ["title", "content"],
    });

    const fuseResults = fuse.search(data);

    const searchResult: Prompt[] = fuseResults.map((result) => result.item);

    setSearchPrompts(searchResult);
  };

  useEffect(() => {
    getPrompt();
  }, []);

  useEffect(() => {
    searchPrompt(searchInput);
  }, [searchInput]);

  return (
    <div className="modal-mask">
      <Modal
        title={Locale.Settings.Prompt.Modal.Title}
        onClose={() => props.onClose?.()}
        actions={[
          <IconButton
            key="add"
            onClick={() => {
              const promptId = {
                id: nanoid(),
                email: email,
                title: "Empty Prompt",
                content: "Empty Prompt Content",
                isUser: true,
              };
              setEditingPrompt(promptId);
            }}
            icon={<AddIcon />}
            bordered
            text={Locale.Settings.Prompt.Modal.Add}
          />,
        ]}
      >
        <div className={styles["user-prompt-modal"]}>
          <input
            type="text"
            className={styles["user-prompt-search"]}
            placeholder={Locale.Settings.Prompt.Modal.Search}
            value={searchInput}
            onInput={(e) => setSearchInput(e.currentTarget.value)}
          ></input>

          <Steps
            steps={steps}
            index={currentStepIndex}
            onStepChange={setCurrentStepIndex}
          />

          <div
            className={styles["message-exporter-body"]}
            style={currentStep.value !== "system" ? { display: "none" } : {}}
          >
            <div className={styles["user-prompt-list"]}>
              {prompts.map(
                (v, _) =>
                  !v.isUser && (
                    <div
                      className={styles["user-prompt-item"]}
                      key={v.id ?? v.title}
                    >
                      <div className={styles["user-prompt-header"]}>
                        <div className={styles["user-prompt-title"]}>
                          {v.title}
                        </div>
                        <div
                          className={
                            styles["user-prompt-content"] + " one-line"
                          }
                        >
                          {v.content}
                        </div>
                      </div>

                      <div className={styles["user-prompt-buttons"]}>
                        <IconButton
                          icon={<EyeIcon />}
                          className={styles["user-prompt-button"]}
                          onClick={() => setEditingPrompt(v)}
                        />
                        <IconButton
                          icon={<CopyIcon />}
                          className={styles["user-prompt-button"]}
                          onClick={() => copyToClipboard(v.content)}
                        />
                      </div>
                    </div>
                  ),
              )}
            </div>
          </div>
          <div
            className={styles["message-exporter-body"]}
            style={currentStep.value !== "user" ? { display: "none" } : {}}
          >
            <div className={styles["user-prompt-list"]}>
              {prompts.map(
                (v, _) =>
                  v.isUser &&
                  v.userEmail === email && (
                    <div
                      className={styles["user-prompt-item"]}
                      key={v.id ?? v.title}
                    >
                      <div className={styles["user-prompt-header"]}>
                        <div className={styles["user-prompt-title"]}>
                          {v.title}
                        </div>
                        <div
                          className={
                            styles["user-prompt-content"] + " one-line"
                          }
                        >
                          {v.content}
                        </div>
                      </div>

                      <div className={styles["user-prompt-buttons"]}>
                        <IconButton
                          icon={<ClearIcon />}
                          className={styles["user-prompt-button"]}
                          onClick={() => deletePrompt(v.id!)}
                        />
                        <IconButton
                          icon={<EditIcon />}
                          className={styles["user-prompt-button"]}
                          onClick={() => setEditingPrompt(v)}
                        />
                        <IconButton
                          icon={<CopyIcon />}
                          className={styles["user-prompt-button"]}
                          onClick={() => copyToClipboard(v.content)}
                        />
                      </div>
                    </div>
                  ),
              )}
            </div>
          </div>
        </div>
      </Modal>

      {editingPrompt !== undefined && (
        <EditPromptModal
          data={editingPrompt!}
          onGetPrompt={() => getPrompt()}
          onClose={() => setEditingPrompt(undefined)}
        />
      )}
    </div>
  );
}

function EditPromptModal(props: any) {
  const { data } = props;

  const [title, setTitle] = useState(data.title);
  const [content, setcontent] = useState(data.content);

  const handleTitleChange = (title: any) => {
    setTitle(title);
  };

  const handleContentChange = (content: any) => {
    setcontent(content);
  };

  const updatePrompt = async (id: any) => {
    try {
      const newData = {
        id: id,
        userEmail: data.email,
        title: title,
        content: content,
        isUser: data.isUser,
      };

      await axios.post("/api/prompt", newData);
      props.onGetPrompt();
      props.onClose();
    } catch (error) {
      console.error("Errors: ", error);
    }
  };

  return data ? (
    <div className="modal-mask">
      <Modal
        title={Locale.Settings.Prompt.EditModal.Title}
        onClose={props.onClose}
        actions={[
          <IconButton
            key=""
            onClick={() => updatePrompt(data.id)}
            text={Locale.UI.Confirm}
            bordered
          />,
        ]}
      >
        <div className={styles["edit-prompt-modal"]}>
          <input
            type="text"
            value={title}
            readOnly={!data.isUser}
            className={styles["edit-prompt-title"]}
            onChange={(e) => handleTitleChange(e.currentTarget.value)}
          ></input>
          <Input
            value={content}
            className={styles["edit-prompt-content"]}
            rows={10}
            readOnly={!data.isUser}
            onChange={(e) => handleContentChange(e.currentTarget.value)}
          ></Input>
        </div>
      </Modal>
    </div>
  ) : null;
}
