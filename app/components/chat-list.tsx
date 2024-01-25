import DeleteIcon from "../icons/delete.svg";
import DownIcon from "../icons/down.svg";
import AddIcon from "../icons/add.svg";
import DragIcon from "../icons/drag.svg";

import { Accordion, AccordionItem } from "@szhsin/react-accordion";

import styles from "./home.module.scss";
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
} from "@hello-pangea/dnd";

import { useAppConfig, useChatStore } from "../store";

import Locale from "../locales";
import { Link, useNavigate } from "react-router-dom";
import { Path } from "../constant";
import { MaskAvatar } from "./mask";
import { Mask } from "../store/mask";
import { useRef, useEffect, useState } from "react";
import { showConfirm } from "./ui-lib";
import { useMobileScreen } from "../utils";

export function ChatItem(props: {
  onClick?: () => void;
  onDelete?: () => void;
  title: string;
  // count: number;
  // time: string;
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
          // title={`${props.title}\n${Locale.ChatItem.ChatItemCount(
          //   props.count,
          // )}`}
        >
          <DragIcon />
          {props.narrow ? (
            <div className={styles["chat-item-narrow"]}>
              <div className={styles["chat-item-avatar"] + " no-dark"}>
                <MaskAvatar
                  avatar={props.mask.avatar}
                  model={props.mask.modelConfig.model}
                />
              </div>
              {/* <div className={styles["chat-item-narrow-count"]}>
                {props.count}
              </div> */}
            </div>
          ) : (
            <>
              <div className={styles["chat-item-title"]}>{props.title}</div>
              {/* <div className={styles["chat-item-info"]}>
                <div className={styles["chat-item-count"]}>
                  {Locale.ChatItem.ChatItemCount(props.count)}
                </div>
                <div className={styles["chat-item-date"]}>{props.time}</div>
              </div> */}
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
  const config = useAppConfig();

  const [items, setItems] = useState<any>([]);

  useEffect(() => {
    const uniqueData = Object.values(
      sessions.reduce((acc: any, item) => {
        if (!acc[item.groupId]) {
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

  const onDragEnd: OnDragEndResponder = (result) => {
    const { destination, source } = result;
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
      <Droppable droppableId="chat-list">
        {(provided) => (
          <div
            className={styles["chat-list"]}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            <Accordion allowMultiple>
              {items.map((accordionItem: any, i: any) => (
                <div style={{ position: "relative" }} key={i}>
                  <AccordionItem
                    className={styles["accordionItem"]}
                    header={
                      <div className={styles["accordion-title-icon"]}>
                        <DownIcon />
                      </div>
                    }
                    key={accordionItem.groupId}
                    initialEntered
                  >
                    {sessions.map(
                      (item, i) =>
                        accordionItem.groupId === item.groupId && (
                          <ChatItem
                            title={item.topic}
                            // time={new Date(item.lastUpdate).toLocaleString()}
                            // count={item.messages.length}
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
                        ),
                    )}
                  </AccordionItem>

                  <div
                    style={{
                      position: "absolute",
                      zIndex: "1000",
                      top: "7px",
                      left: "30px",
                    }}
                  >
                    <input
                      className={styles["accordion-title"]}
                      value={accordionItem.groupTitle}
                      onChange={(e) => handleTitleChange(e, i)}
                    />
                  </div>

                  <div
                    style={{
                      position: "absolute",
                      zIndex: "1000",
                      top: "10px",
                      right: "10px",
                    }}
                    onClick={() => {
                      chatStore.newGroupSession(accordionItem);
                    }}
                  >
                    <AddIcon />
                  </div>
                </div>
              ))}
              {provided.placeholder}
            </Accordion>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
