import React, { useEffect, useMemo, useState } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import io from "socket.io-client";
import { HiMoon, HiSun } from "react-icons/hi2";
import SignUp from "./Pages/SignUp";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import { setAllOnlineUsers, setSocket } from "./redux/slices/socket";
import "./App.css";

const App = () => {
  const { token } = useSelector((state) => state.auth);
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  const toggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", nextTheme);
      return nextTheme;
    });
  };

  const router = useMemo(
    () =>
      createBrowserRouter([
        {
          path: "/",
          element: token ? <Home theme={theme} /> : <SignUp theme={theme} />,
        },
        {
          path: "/login",
          element: token ? <Home theme={theme} /> : <Login theme={theme} />,
        },
        {
          path: "/home",
          element: token ? <Home theme={theme} /> : <Navigate to={"/login"} />,
        },
      ]),
    [theme, token]
  );

  useEffect(() => {
    if (!token || !userData?._id) {
      dispatch(setSocket(null));
      dispatch(setAllOnlineUsers([]));
      return;
    }

    const socket = io(`${import.meta.env.VITE_SOCKET_URL}`, {
      query: {
        userId: userData?._id,
      },
    });

    dispatch(setSocket(socket));

    socket.on("send-all-online-users", (data) => {
      dispatch(setAllOnlineUsers(data));
    });

    return () => {
      socket.off("send-all-online-users");
      socket.disconnect();
    };
  }, [dispatch, token, userData?._id]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="app-shell" data-theme={theme}>
      <div className="app-shell__aurora app-shell__aurora--left" />
      <div className="app-shell__aurora app-shell__aurora--right" />
      <div className="app-shell__grid" />
      <button
        type="button"
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        {theme === "light" ? <HiMoon className="text-xl" /> : <HiSun className="text-xl" />}
        <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
      </button>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background:
              theme === "dark" ? "rgba(15, 23, 42, 0.94)" : "rgba(255, 251, 235, 0.96)",
            color: theme === "dark" ? "#f8fafc" : "#1e293b",
            border:
              theme === "dark"
                ? "1px solid rgba(148, 163, 184, 0.18)"
                : "1px solid rgba(251, 191, 36, 0.25)",
            boxShadow:
              theme === "dark"
                ? "0 18px 45px rgba(15, 23, 42, 0.28)"
                : "0 18px 45px rgba(251, 191, 36, 0.12)",
          },
        }}
      />
    </div>
  );
};

export default App;
