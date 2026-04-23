import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { HiArrowRight, HiOutlineMail, HiOutlineLockClosed } from "react-icons/hi";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/common/Loader";
import { setToken } from "../redux/slices/auth";
import { setUserDetails } from "../redux/slices/user";

const Login = ({ theme }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onchangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submithandler = async (e) => {
    e.preventDefault();
    const tosatId = toast.loading("Logging you in...");

    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/login`,
        formData
      );

      if (!response.data.success) {
        throw new Error("Error occur during login");
      }

      dispatch(setToken(response.data.token));
      dispatch(setUserDetails(response.data.userDeatils));
      toast.dismiss(tosatId);
      navigate("/home");
      toast.success(response.data.message);
    } catch (error) {
      toast.dismiss(tosatId);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === "dark";
  const inputClassName = isDark
    ? "w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3.5 pl-12 text-sm text-slate-50 outline-none transition duration-300 placeholder:text-slate-500 focus:border-cyan-400/60 focus:bg-slate-950"
    : "w-full rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3.5 pl-12 text-sm text-slate-700 outline-none transition duration-300 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-indigo-50/70";

  return (
    <main className="relative z-10 flex min-h-[100dvh] items-center justify-center px-4 py-6 sm:px-6">
      <section className={`w-full max-w-xl overflow-hidden rounded-[2rem] border backdrop-blur-2xl ${
        isDark
          ? "border-white/10 bg-slate-950/60 shadow-[0_40px_120px_rgba(2,6,23,0.55)]"
          : "border-amber-100 bg-[#fff8ef]/80 shadow-[0_40px_120px_rgba(251,191,36,0.12)]"
      }`}>
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-xl">
            <div className="mb-8 space-y-3">
              <div className={`inline-flex rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] ${
                isDark
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}>
                Welcome back
              </div>
              <h2 className={`text-3xl font-bold sm:text-4xl ${isDark ? "text-white" : "text-slate-800"}`}>Sign in to continue chatting</h2>
              <p className={isDark ? "text-slate-400" : "text-slate-500"}>
                Your account, conversations, and live presence are all ready.
              </p>
            </div>

            <form className="space-y-5" onSubmit={submithandler}>
              <label className="block space-y-2">
                <span className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>Email address</span>
                <div className="relative">
                  <HiOutlineMail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-500" />
                  <input
                    type="email"
                    className={inputClassName}
                    placeholder="you@example.com"
                    required
                    name="email"
                    onChange={onchangeHandler}
                    value={formData.email}
                  />
                </div>
              </label>

              <label className="block space-y-2">
                <span className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>Password</span>
                <div className="relative">
                  <HiOutlineLockClosed className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-500" />
                  <input
                    type="password"
                    className={inputClassName}
                    placeholder="Enter your password"
                    required
                    name="password"
                    onChange={onchangeHandler}
                    value={formData.password}
                  />
                </div>
              </label>

              <button
                disabled={loading}
                className={`flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-3.5 text-base font-semibold text-slate-950 transition duration-300 hover:translate-y-[-1px] ${
                  isDark
                    ? "bg-gradient-to-r from-cyan-400 to-sky-500 hover:shadow-[0_18px_40px_rgba(14,165,233,0.3)]"
                    : "bg-gradient-to-r from-amber-300 via-rose-300 to-indigo-300 hover:shadow-[0_18px_40px_rgba(129,140,248,0.18)]"
                }`}
                type="submit"
              >
                {loading ? <Loader /> : "Log in"}
                {!loading && <HiArrowRight className="text-xl" />}
              </button>
            </form>

            <p className={`mt-6 text-center text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Don&apos;t have an account?{" "}
              <Link to={"/"} className={`font-semibold transition ${isDark ? "text-cyan-300 hover:text-cyan-200" : "text-indigo-500 hover:text-indigo-600"}`}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
