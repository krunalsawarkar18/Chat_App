import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeToken } from "../../redux/slices/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { clearUserDetails } from "../../redux/slices/user";
import axios from "axios";
import Loader from "../common/Loader";
import { HiOutlineLogout, HiOutlineSearch } from "react-icons/hi";

const getInitials = (user) =>
  `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() || "VP";

const SideBar = ({ theme, setChatUserId, setChatUser, chatUserId }) => {
  const { userData } = useSelector((state) => state.user);
  const { token } = useSelector((state) => state.auth);
  const { allOnlineUsers } = useSelector((state) => state.socketIo);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [orignalAllUsers, setOrignalAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const logoutHandler = () => {
    const confirm = window.confirm("Are you sure want to logout?");

    if (!confirm) {
      return;
    }

    dispatch(removeToken());
    dispatch(clearUserDetails());
    toast.success("Logout Successfully");
    navigate("/login");
  };

  useEffect(() => {
    if (!token) {
      setAllUsers([]);
      setOrignalAllUsers([]);
      return;
    }

    const getAllUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/getAllUsers`,
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        if (!response.data.success) {
          throw new Error("Error occur during fetching all users");
        }

        setAllUsers(response.data.allUsers);
        setOrignalAllUsers(response.data.allUsers);
      } catch (error) {
        toast.error(error.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    getAllUsers();
  }, [token]);

  const searchHandler = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(e.target.value);

    if (!value) {
      setAllUsers(orignalAllUsers);
      return;
    }

    const searchUsers = orignalAllUsers.filter((user) => {
      const fullName = `${user?.firstName} ${user?.lastName}`.toLowerCase();
      return fullName.includes(value);
    });

    setAllUsers(searchUsers);
  };

  const onlineCount = useMemo(
    () =>
      allUsers.filter((user) => allOnlineUsers.includes(user?._id)).length,
    [allOnlineUsers, allUsers]
  );

  const classes =
    theme === "dark"
      ? {
          wrapper: "bg-[linear-gradient(180deg,#0f172a_0%,#020617_100%)]",
          header: "border-white/10",
          brand: "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
          brandDot: "bg-cyan-300",
          title: "text-white",
          bodyText: "text-slate-400",
          profileCard: "border-white/10 bg-white/5",
          searchIcon: "text-slate-500",
          searchInput:
            "border-white/10 bg-slate-900/90 text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:bg-slate-950",
          empty: "border-white/10 bg-white/5 text-slate-400",
          selectedItem: "border-cyan-300/30 bg-cyan-400/10 shadow-[0_16px_30px_rgba(34,211,238,0.12)]",
          item: "border-white/10 bg-white/[0.04] hover:border-white/15 hover:bg-white/[0.06]",
          avatarRing: "ring-white/10",
          avatarGradient: "from-cyan-400 to-sky-600",
          offlineDot: "bg-slate-500 border-slate-950",
          onlineText: "text-emerald-300",
          offlineText: "text-slate-500",
          bottom: "border-white/10 bg-white/[0.03]",
          bottomOuter: "border-white/10 bg-transparent",
          logout: "border-white/10 bg-slate-900 text-slate-200 hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-200",
        }
      : {
          wrapper: "bg-[linear-gradient(180deg,#fefce8_0%,#ecfdf5_100%)]",
          header: "border-amber-100",
          brand: "border-amber-200 bg-amber-50 text-amber-700",
          brandDot: "bg-amber-400",
          title: "text-slate-800",
          bodyText: "text-slate-500",
          profileCard: "border-emerald-100 bg-emerald-50/80",
          searchIcon: "text-amber-400",
          searchInput:
            "border-amber-100 bg-amber-50/70 text-slate-700 placeholder:text-slate-400 focus:border-amber-300 focus:bg-amber-50",
          empty: "border-amber-100 bg-amber-50/60 text-slate-500",
          selectedItem: "border-indigo-200 bg-indigo-50/80 shadow-[0_16px_30px_rgba(129,140,248,0.16)]",
          item: "border-amber-100 bg-[#fff8ef]/85 hover:border-emerald-200 hover:bg-emerald-50/70",
          avatarRing: "ring-amber-100",
          avatarGradient: "from-amber-300 to-emerald-300",
          offlineDot: "bg-slate-300 border-white",
          onlineText: "text-emerald-600",
          offlineText: "text-slate-400",
          bottom: "border-amber-100 bg-[#fff8ef]",
          bottomOuter: "border-amber-100 bg-amber-50/55",
          logout: "border-amber-100 bg-amber-50 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-500",
        };

  return (
    <div className={`flex h-full flex-col ${classes.wrapper}`}>
      <div className={`space-y-6 border-b px-5 py-5 ${classes.header}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] ${classes.brand}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${classes.brandDot}`} />
              CheatChat
            </div>
            <h2 className={`mt-4 text-3xl font-bold ${classes.title}`}>Messages</h2>
            <p className={`mt-2 text-sm ${classes.bodyText}`}>
              {onlineCount} online now. Pick a conversation and jump in.
            </p>
          </div>

          <div className={`rounded-2xl border px-3 py-2 text-right shadow-sm ${classes.profileCard}`}>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">You</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              {userData?.firstName} {userData?.lastName}
            </p>
          </div>
        </div>

        <div className="relative">
          <HiOutlineSearch className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl ${classes.searchIcon}`} />
          <input
            type="text"
            placeholder="Search people..."
            className={`w-full rounded-2xl border py-3 pl-12 pr-4 text-sm outline-none transition duration-300 ${classes.searchInput}`}
            onChange={searchHandler}
            value={searchTerm}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader />
          </div>
        ) : allUsers.length < 1 ? (
          <div className={`flex h-full flex-col items-center justify-center rounded-[1.75rem] border border-dashed px-6 text-center ${classes.empty}`}>
            <p className={`text-lg font-semibold ${classes.title}`}>No users found</p>
            <p className={`mt-2 text-sm ${classes.bodyText}`}>
              Try a different search term to find someone faster.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {allUsers.map((user) => {
              const isOnline = allOnlineUsers.includes(user?._id);
              const isSelected = chatUserId === user?._id;

              return (
                <button
                  key={user?._id}
                  onClick={() => {
                    setChatUserId(user?._id);
                    setChatUser(user);
                  }}
                  className={`flex w-full items-center gap-4 rounded-[1.4rem] border px-4 py-3 text-left transition duration-300 ${
                    isSelected
                      ? classes.selectedItem
                      : classes.item
                  }`}
                >
                  <div className="relative shrink-0">
                    {user?.profilePicture ? (
                      <img
                        src={user?.profilePicture}
                        alt={`${user?.firstName} profile`}
                        className={`h-14 w-14 rounded-2xl object-cover ring-1 ${classes.avatarRing}`}
                      />
                    ) : (
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${classes.avatarGradient} text-sm font-bold text-slate-800`}>
                        {getInitials(user)}
                      </div>
                    )}

                    <span
                      className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 ${
                        isOnline ? "bg-emerald-400 border-white" : classes.offlineDot
                      }`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-semibold ${classes.title}`}>
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className={`mt-1 text-xs font-medium ${isOnline ? classes.onlineText : classes.offlineText}`}>
                      {isOnline ? "Online now" : "Away"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className={`border-t px-4 py-4 ${classes.bottomOuter}`}>
        <div className={`flex items-center justify-between gap-3 rounded-[1.5rem] border px-4 py-3 shadow-sm ${classes.bottom}`}>
          <div className="flex min-w-0 items-center gap-3">
            {userData?.profilePicture ? (
              <img
                src={userData?.profilePicture}
                alt="profilePicture"
                className={`h-12 w-12 rounded-2xl object-cover ring-1 ${classes.avatarRing}`}
              />
            ) : (
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${classes.avatarGradient} text-sm font-bold text-slate-800`}>
                {getInitials(userData)}
              </div>
            )}

            <div className="min-w-0">
              <p className={`truncate text-sm font-semibold ${classes.title}`}>
                {userData?.firstName} {userData?.lastName}
              </p>
              <p className={`text-xs ${classes.bodyText}`}>Signed in</p>
            </div>
          </div>

          <button
            className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition duration-300 ${classes.logout}`}
            onClick={logoutHandler}
            title="Logout"
          >
            <HiOutlineLogout className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
