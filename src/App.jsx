import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

const API_KEY = "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";

function App() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello I am Jarvis!",
      sender: "Jarvis",
    },
  ]);

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing",
    };

    const newMessages = [...messages, newMessage]; //all the old messages + new messages

    //update our message state
    setMessages(newMessages);

    //set a typing indicator(Jarvis typing...)
    setTyping(true);

    //process the message to chatgpt
    await processMessageToJarvis(newMessages);
  };

  async function processMessageToJarvis(chatMessages) {
    //chatMessages {sender:"user" or "Jarvis", message:"The message content here"}
    //apiMessages {role:"user" or "assistant",content: "The message content here"}
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "Jarvis") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    //role:"user" -> a message from the user , "assistant" -> resoponce from Jarvis
    //"system"->generally intaial message defing how jarvis to talk

    const systemMessage = {
      role: "system",
      content: "Speak like pirate", //speak like pirate
    };

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...apiMessages], //message 1, message 2, message 3
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },

      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);
        console.log(data.choices[0].message.content);
        setMessages([
          ...chatMessages,
          {
            message: data.choices[0].message.content,
            sender: "Jarvis",
          },
        ]);
        setTyping(false);
      });
  }

  return (
    <>
      <div>
        <div
          style={{
            position: "relative",
            height: "800px",
            width: "700px",
          }}
        >
          <MainContainer>
            <ChatContainer>
              <MessageList
                scrollBehavior="smooth"
                typingIndicator={
                  typing ? (
                    <TypingIndicator content=" Jarvis is typing " />
                  ) : null
                }
              >
                {messages.map((message, i) => {
                  return <Message key={i} model={message} />;
                })}
              </MessageList>
              <MessageInput
                placeholder="Type message here"
                onSend={handleSend}
              />
            </ChatContainer>
          </MainContainer>
        </div>
      </div>
    </>
  );
}

export default App;
