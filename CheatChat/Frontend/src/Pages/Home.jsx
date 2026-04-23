import React, { useEffect, useState } from "react";
import SideBar from "../components/Home/SideBar";
import MessagesContainer from "../components/Home/MessagesContainer";

const Home = ({ theme }) => {
  const [chatUserId, setChatUserId] = useState(null);
  const [chatUser, setChatUser] = useState(null);

  useEffect(() => {
    document.body.dataset.page = "home";
    return () => {
      delete document.body.dataset.page;
    };
  }, []);

  const exitChatHandler = () => {
    setChatUserId(null);
    setChatUser(null);
  };

  const shellClassName =
    theme === "dark"
      ? "border-white/10 bg-slate-950/55 shadow-[0_35px_120px_rgba(2,6,23,0.6)]"
      : "border-orange-100/80 bg-[#fff8ef]/80 shadow-[0_30px_90px_rgba(251,191,36,0.12)]";

  const sidebarClassName =
    theme === "dark"
      ? "border-white/10 bg-slate-950/55"
      : "border-orange-100 bg-[linear-gradient(180deg,rgba(254,252,232,0.95),rgba(236,253,245,0.9))]";

  const contentClassName =
    theme === "dark"
      ? "bg-[linear-gradient(180deg,rgba(15,23,42,0.65),rgba(2,6,23,0.85))]"
      : "bg-[linear-gradient(180deg,#eef2ff_0%,#ecfeff_52%,#fefce8_100%)]";

  return (
    <main className="relative z-10 flex min-h-[100dvh] items-center justify-center px-4 py-5 sm:px-6 lg:px-8">
      <section className={`flex h-[92dvh] w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] border backdrop-blur-xl lg:flex-row ${shellClassName}`}>
        <div
          className={`min-h-0 flex-1 w-full border-b lg:flex-none lg:w-[32%] lg:border-b-0 lg:border-r ${sidebarClassName} ${
            chatUserId ? "hidden lg:block" : "block"
          }`}
        >
          <SideBar
            theme={theme}
            setChatUserId={setChatUserId}
            setChatUser={setChatUser}
            chatUserId={chatUserId}
          />
        </div>

        <div
          className={`min-h-0 flex-1 ${contentClassName} ${
            chatUserId ? "block" : "hidden lg:block"
          }`}
        >
          <MessagesContainer
            theme={theme}
            chatUserId={chatUserId}
            chatUser={chatUser}
            onExitChat={exitChatHandler}
          />
        </div>
      </section>
    </main>
  );
};

export default Home;
