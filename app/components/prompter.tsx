import { useEffect, useState } from "react";
import { Prompt, SearchService, usePromptStore } from "../store/prompt";

import styles from "./settings.module.scss";

import Locale from "../locales";

import { IconButton } from "./button";
import { nanoid } from "nanoid";

import {
    Input,
    Modal
} from "./ui-lib";

import { copyToClipboard } from "../utils";

import AddIcon from "../icons/add.svg";
import CopyIcon from "../icons/copy.svg";
import ClearIcon from "../icons/clear.svg";
import EditIcon from "../icons/edit.svg";
import EyeIcon from "../icons/eye.svg";

export function UserPromptModal(props: { onClose?: () => void }) {
    const promptStore = usePromptStore();
    const userPrompts = promptStore.getUserPrompts();
    const builtinPrompts = SearchService.builtinPrompts;
    const allPrompts = userPrompts.concat(builtinPrompts);
    const [searchInput, setSearchInput] = useState("");
    const [searchPrompts, setSearchPrompts] = useState<Prompt[]>([]);
    const prompts = searchInput.length > 0 ? searchPrompts : allPrompts;

    const [editingPromptId, setEditingPromptId] = useState<string>();

    useEffect(() => {
        if (searchInput.length > 0) {
            const searchResult = SearchService.search(searchInput);
            setSearchPrompts(searchResult);
        } else {
            setSearchPrompts([]);
        }
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
                            const promptId = promptStore.add({
                                id: nanoid(),
                                createdAt: Date.now(),
                                title: "Empty Prompt",
                                content: "Empty Prompt Content",
                            });
                            setEditingPromptId(promptId);
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

                    <div className={styles["user-prompt-list"]}>
                        {prompts.map((v, _) => (
                            <div className={styles["user-prompt-item"]} key={v.id ?? v.title}>
                                <div className={styles["user-prompt-header"]}>
                                    <div className={styles["user-prompt-title"]}>{v.title}</div>
                                    <div className={styles["user-prompt-content"] + " one-line"}>
                                        {v.content}
                                    </div>
                                </div>

                                <div className={styles["user-prompt-buttons"]}>
                                    {v.isUser && (
                                        <IconButton
                                            icon={<ClearIcon />}
                                            className={styles["user-prompt-button"]}
                                            onClick={() => promptStore.remove(v.id!)}
                                        />
                                    )}
                                    {v.isUser ? (
                                        <IconButton
                                            icon={<EditIcon />}
                                            className={styles["user-prompt-button"]}
                                            onClick={() => setEditingPromptId(v.id)}
                                        />
                                    ) : (
                                        <IconButton
                                            icon={<EyeIcon />}
                                            className={styles["user-prompt-button"]}
                                            onClick={() => setEditingPromptId(v.id)}
                                        />
                                    )}
                                    <IconButton
                                        icon={<CopyIcon />}
                                        className={styles["user-prompt-button"]}
                                        onClick={() => copyToClipboard(v.content)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>

            {editingPromptId !== undefined && (
                <EditPromptModal
                    id={editingPromptId!}
                    onClose={() => setEditingPromptId(undefined)}
                />
            )}
        </div>
    );
}

function EditPromptModal(props: { id: string; onClose: () => void }) {
    const promptStore = usePromptStore();
    const prompt = promptStore.get(props.id);

    return prompt ? (
        <div className="modal-mask">
            <Modal
                title={Locale.Settings.Prompt.EditModal.Title}
                onClose={props.onClose}
                actions={[
                    <IconButton
                        key=""
                        onClick={props.onClose}
                        text={Locale.UI.Confirm}
                        bordered
                    />,
                ]}
            >
                <div className={styles["edit-prompt-modal"]}>
                    <input
                        type="text"
                        value={prompt.title}
                        readOnly={!prompt.isUser}
                        className={styles["edit-prompt-title"]}
                        onInput={(e) =>
                            promptStore.updatePrompt(
                                props.id,
                                (prompt) => (prompt.title = e.currentTarget.value),
                            )
                        }
                    ></input>
                    <Input
                        value={prompt.content}
                        readOnly={!prompt.isUser}
                        className={styles["edit-prompt-content"]}
                        rows={10}
                        onInput={(e) =>
                            promptStore.updatePrompt(
                                props.id,
                                (prompt) => (prompt.content = e.currentTarget.value),
                            )
                        }
                    ></Input>
                </div>
            </Modal>
        </div>
    ) : null;
}
