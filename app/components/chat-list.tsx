import DeleteIcon from "../icons/delete.svg";
import DownIcon from "../icons/down.svg";
import UpIcon from "../icons/up.svg";
import BotIcon from "../icons/bot.svg";
import AddIcon from "../icons/add.svg";
import TrashIcon from "../icons/trash1.svg";

import styles from "./home.module.scss";
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
} from "@hello-pangea/dnd";

import { useChatStore } from "../store";

import Locale from "../locales";
import { Link, useNavigate } from "react-router-dom";
import { Path } from "../constant";
import { MaskAvatar } from "./mask";
import { Mask } from "../store/mask";
import { useRef, useEffect, useState } from "react";
import { showConfirm } from "./ui-lib";
import { useMobileScreen } from "../utils";
import { Accordion, AccordionItem } from "@szhsin/react-accordion";
import { ConfirmModal } from "./prompter";

export function ChatItem(props: {
  onClick?: () => void;
  onDelete?: () => void;
  title: string;
  selected: boolean;
  id: string;
  index: number;
  narrow?: boolean;
  mask: Mask;
}) {
  const draggableRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (props.selected && draggableRef.current) {
      draggableRef.current?.scrollIntoView({
        block: "center",
      });
    }
  }, [props.selected]);
  return (
    <Draggable draggableId={`${props.id}`} index={props.index}>
      {(provided) => (
        <div
          className={`${styles["chat-item"]} ${
            props.selected && styles["chat-item-selected"]
          }`}
          onClick={props.onClick}
          ref={(ele) => {
            draggableRef.current = ele;
            provided.innerRef(ele);
          }}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {props.narrow ? (
            <div className={styles["chat-item-narrow"]}>
              <div className={styles["chat-item-avatar"] + " no-dark"}>
                <MaskAvatar
                  avatar={props.mask.avatar}
                  model={props.mask.modelConfig.model}
                />
              </div>
            </div>
          ) : (
            <>
              <div className={styles["chat-item-title"]}>{props.title}</div>
            </>
          )}

          <div
            className={styles["chat-item-delete"]}
            onClickCapture={(e) => {
              props.onDelete?.();
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <DeleteIcon />
          </div>
        </div>
      )}
    </Draggable>
  );
}

function isHeaderCheck(data: any) {
  if (data.isHeader === true) return data;
}

export function ChatList(props: { narrow?: boolean }) {
  const [sessions, selectedIndex, selectSession, moveSession] = useChatStore(
    (state) => [
      state.sessions,
      state.currentSessionIndex,
      state.selectSession,
      state.moveSession,
    ],
  );

  const chatStore = useChatStore();
  const navigate = useNavigate();
  const isMobileScreen = useMobileScreen();
  const [showModal, setShowModal] = useState(false);

  const [items, setItems] = useState<any>([]);

  useEffect(() => {
    const uniqueData = Object.values(
      sessions.reduce((acc: any, item) => {
        if (item.isHeader === true) {
          acc[item.groupId] = item;
          acc[item.groupId].groupTitle = acc[item.groupId].groupTitle
            ? acc[item.groupId].groupTitle
            : "General";
        }
        return acc;
      }, {}),
    );

    setItems(uniqueData);
  }, [sessions]);

  const moveGroup = (id: any, destination: any) => {
    console.log(sessions);

    console.log(destination.droppableId);
    for (let i = 0; i < sessions.length; i++) {
      if (sessions[i].id === id) {
        if (destination.droppableId === "chat-list") {
          sessions[i].groupId = "";
        } else {
          sessions[i].groupId = destination.droppableId;
        }
      }
    }
  };

  const onDragEnd: OnDragEndResponder = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    moveSession(source.index, destination.index);
    moveGroup(draggableId, destination);
  };

  const handleTitleChange = (event: any, index: any) => {
    const newTitle = event.currentTarget.value;

    setItems((prevItems: any) =>
      prevItems.map((item: any, i: any) => {
        if (i === index) {
          return { ...item, groupTitle: newTitle };
        }
        return item;
      }),
    );
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Accordion allowMultiple>
        {items.map(
          (accordionItem: any, i: any) =>
            accordionItem.isHeader && (
              <div style={{ position: "relative" }} key={i}>
                <Droppable droppableId={`${accordionItem.groupId}`}>
                  {(provided) => (
                    <div
                      className={styles["chat-list"]}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <div>
                        <AccordionItem
                          className={styles["accordionItem"]}
                          header={({ state }) => {
                            return state.isEnter ? (
                              <div className={styles["accordion-title-icon"]}>
                                <DownIcon />
                              </div>
                            ) : (
                              <div className={styles["accordion-title-icon"]}>
                                <UpIcon />
                              </div>
                            );
                          }}
                          key={accordionItem.groupId}
                          initialEntered
                        >
                          {sessions.map((item, i) => {
                            if (
                              item.groupId === accordionItem.groupId &&
                              !item.isHeader
                            ) {
                              return (
                                <ChatItem
                                  title={item.topic}
                                  key={item.id}
                                  id={item.id}
                                  index={i}
                                  selected={i === selectedIndex}
                                  onClick={() => {
                                    navigate(Path.Chat);
                                    selectSession(i);
                                  }}
                                  onDelete={async () => {
                                    if (
                                      (!props.narrow && !isMobileScreen) ||
                                      (await showConfirm(
                                        Locale.Home.DeleteChat,
                                      ))
                                    ) {
                                      chatStore.deleteSession(i);
                                    }
                                  }}
                                  narrow={props.narrow}
                                  mask={item.mask}
                                />
                              );
                            } else {
                              return null;
                            }
                          })}
                        </AccordionItem>

                        <div
                          style={{
                            position: "absolute",
                            zIndex: "1000",
                            top: "5px",
                            left: "30px",
                          }}
                        >
                          <input
                            className={styles["accordion-title"]}
                            value={accordionItem.groupTitle}
                            onChange={(e) => handleTitleChange(e, i)}
                            disabled
                          />
                        </div>

                        <div
                          style={{
                            position: "absolute",
                            zIndex: "1000",
                            top: "10px",
                            right: "30px",
                          }}
                          onClick={() => {
                            chatStore.newGroupSession(accordionItem);
                          }}
                        >
                          <AddIcon />
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            zIndex: "1000",
                            top: "6px",
                            right: "10px",
                          }}
                          onClickCapture={() => {
                            setShowModal(true);
                          }}
                        >
                          {showModal && (
                            <ConfirmModal
                              action={() => {
                                chatStore.deleteGroupSession(
                                  accordionItem.groupId,
                                );
                                setShowModal(false);
                              }}
                              onClose={() => setShowModal(false)}
                            />
                          )}
                          <TrashIcon />
                        </div>
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ),
        )}
      </Accordion>
      <Droppable droppableId="chat-list">
        {(provided) => (
          <div
            className={styles["chat-list"]}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {sessions.map((item, i) =>
              !item.isHeader && !item.groupId ? (
                <ChatItem
                  title={item.topic}
                  key={item.id}
                  id={item.id}
                  index={i}
                  selected={i === selectedIndex}
                  onClick={() => {
                    navigate(Path.Chat);
                    selectSession(i);
                  }}
                  onDelete={async () => {
                    if (
                      (!props.narrow && !isMobileScreen) ||
                      (await showConfirm(Locale.Home.DeleteChat))
                    ) {
                      chatStore.deleteSession(i);
                    }
                  }}
                  narrow={props.narrow}
                  mask={item.mask}
                />
              ) : null,
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
