import React, { useState } from "react";
import { auth, googleProvider } from "../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import companyLogo from "../Assets/logo1.jpg";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const clearFields = () => {
    setEmail("");
    setPassword("");
  };

  const login = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Directly set user without fetching role
      setUser(user);
      setErrorMsg("");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setErrorMsg("User not found. Please sign up first.");
      } else if (error.code === "auth/wrong-password") {
        setErrorMsg("Incorrect password. Please try again.");
      } else {
        setErrorMsg("Login failed. Please check your credentials.");
      }
    }
  };

  const signUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Directly set user without fetching role
      setUser(user);
      setErrorMsg("");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setErrorMsg("Email already in use. Please login instead.");
      } else if (error.code === "auth/weak-password") {
        setErrorMsg("Password too weak. Use at least 6 characters.");
      } else {
        setErrorMsg("Sign up failed. Please try again.");
      }
    }
  };

  const loginWithGoogle = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // Directly set user without fetching role
      setUser(user);
      setErrorMsg("");
    } catch {
      setErrorMsg("Error logging in with Google.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-80 text-center">
        <img src={companyLogo} alt="Logo" className="h-16 mx-auto mb-6" />
        <h2 className="text-3xl font-semibold mb-6 text-gray-900">
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {errorMsg}
          </div>
        )}

        <label className="block text-left font-bold mb-1">Email</label>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded focus:outline-yellow-400"
        />

        <label className="block text-left font-bold mb-1">Password</label>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-6 border rounded focus:outline-yellow-400"
        />

        {isLogin ? (
          <>
            <button
              onClick={login}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold mb-4 transition"
            >
              Login
            </button>

            <button
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded hover:bg-gray-100 transition mb-4"
            >
              <FcGoogle size={22} />
              Login with Google
            </button>

            <p className="text-sm text-gray-700">
              Don't have an account?{" "}
              <button
                onClick={() => {
                  setIsLogin(false);
                  setErrorMsg("");
                  clearFields();
                }}
                className="text-blue-900 font-semibold hover:underline"
              >
                Sign Up
              </button>
            </p>
          </>
        ) : (
          <>
            <button
              onClick={signUp}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold mb-4 transition"
            >
              Sign Up
            </button>

            <button
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded hover:bg-gray-100 transition mb-4"
            >
              <FcGoogle size={22} />
              Sign Up with Google
            </button>

            <p className="text-sm text-gray-700">
              Already have an account?{" "}
              <button
                onClick={() => {
                  setIsLogin(true);
                  setErrorMsg("");
                  clearFields();
                }}
                className="text-blue-900 font-semibold hover:underline"
              >
                Login
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
