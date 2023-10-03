import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import { IconButton, Spinner, Tag, TagLabel, TagLeftIcon, useToast, HStack } from "@chakra-ui/react";
// import { AddIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState } from "react";
import axios from "axios";
import { AddIcon, ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
const ENDPOINT = "https://dialogue-depot-nodejs.onrender.com/";
var socket, selectedChatCompare;


const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [isAIgen, setisAIgen] = useState(false);
  const [aiMessage, setaiMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Access-Control-Allow-Origin": "*"
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `${process.env.REACT_APP_SERVER_API}/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          `${process.env.REACT_APP_SERVER_API}/api/message`,
          {
            content: newMessage,
            chatId: selectedChat,
          },
          config
        );
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
  }, [selectedChat]);


  useEffect(() => {
    socket.on("message recieved", async (newMessageRecieved) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
        setisAIgen(true);
        setaiMessage("");
        const aiMessage = await fetch(`${process.env.REACT_APP_FLASK_API}/api`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Set the Content-Type header
          },
          body: JSON.stringify({
            text: newMessageRecieved.content,
          }),
        });
        const ai = await aiMessage.json();
        setaiMessage(ai.message);
      }
    });
  }, [messages, notification]);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {" "}
      {selectedChat ? (
        <>
          <Text
            fontSize={{
              base: "28px",
              md: "30px",
            }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            d="flex"
            justifyContent={{
              base: "space-between",
            }}
            alignItems="center"
          >
            <IconButton
              d={{
                base: "flex",
                md: "none",
              }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />{" "}
            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  {" "}
                  {getSender(user, selectedChat.users)}{" "}
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />{" "}
                </>
              ) : (
                <>
                  {" "}
                  {selectedChat.chatName.toUpperCase()}{" "}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />{" "}
                </>
              ))}{" "}
          </Text>{" "}
          <Box
            d="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />{" "}
              </div>
            )}
            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
            >
              {istyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    // height={50}
                    width={70}
                    style={{
                      marginBottom: 15,
                      marginLeft: 0,
                    }}
                  />{" "}
                </div>
              ) : (
                <> </>
              )}{" "}
              <div>
                {isAIgen ? (
                  <HStack spacing={4} style={
                    {
                      marginBottom: 15,
                      marginLeft: 0,
                    }
                  }>
                    {aiMessage === "" ? (
                      <Tag style={{
                        cursor: 'pointer',
                      }} size="md" variant='subtle' colorScheme='blue'>

                        <Spinner
                          size="sm"
                          w={5}
                          h={5}
                          alignSelf="center"
                          margin="auto"
                          padding={2}
                        />
                        <TagLabel padding={2}>
                          Generating AI response...
                        </TagLabel>

                      </Tag>
                    ) : (
                      <Tag style={{
                        cursor: 'pointer',
                      }} onClick={() => { setNewMessage(aiMessage); setisAIgen(false) }} size="md" variant='subtle' colorScheme='blue'>

                        <TagLeftIcon boxSize='12px' as={AddIcon} />
                        <TagLabel padding={2}>
                          {aiMessage}
                        </TagLabel>
                      </Tag>
                    )}
                  </HStack>
                ) : (<></>)}
              </div>
              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter a message.."
                value={newMessage}
                onChange={typingHandler}
              />{" "}
            </FormControl>{" "}
          </Box>{" "}
        </>
      ) : (
        // to get socket.io on same page
        <Box d="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting{" "}
          </Text>{" "}
        </Box>
      )}{" "}
    </>
  );
};

export default SingleChat;
