import { Routes, Route } from "react-router-dom";
import SignUpPage from "./modules/auth/signUpPage";
import Layout from "./components/Layout";
import LoginPage from "./modules/auth/loginPage";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "./app/store";
import { webSocketService } from "./webSockets/socketService";
import { usersTopicSubscription } from "./webSockets/subscriptionTopics/usersTopicSubscription";
import { getUserLocation } from "./global/api";

function App() {
  const dispatch = useDispatch<AppDispatch>();

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [promptReady, setPromptReady] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Delay the visual indicator or trigger
      setTimeout(() => {
        setPromptReady(true); // show button or auto-trigger logic
      }, 1000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  // Optional: Automatically prompt on first tap
  useEffect(() => {
    if (!deferredPrompt || !promptReady) return;

    const autoPrompt = () => {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        console.log("User choice:", choiceResult.outcome);
        setDeferredPrompt(null);
      });
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener("click", autoPrompt);
      window.removeEventListener("touchstart", autoPrompt);
    };

    window.addEventListener("click", autoPrompt, { once: true });
    window.addEventListener("touchstart", autoPrompt, { once: true });

    return cleanup;
  }, [deferredPrompt, promptReady]);

  // WebSocket connection
  useEffect(() => {
    webSocketService.connect();
    usersTopicSubscription();

    return () => {
      webSocketService.unsubscribe("/topic/users");
      webSocketService.disconnect();
    };
  }, [dispatch]);

  // Location fetch
  useEffect(() => {
    getUserLocation();
  }, []);

  return (
    <>
      {/* Optional fallback button */}
      {/* {promptReady && deferredPrompt && ( */}
      <button
        onClick={() => {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then((choiceResult: any) => {
            console.log("User choice:", choiceResult.outcome);
            setDeferredPrompt(null);
          });
        }}
        style={{
          position: "fixed",
          top: "1rem",
          right: "1rem",
          padding: "0.5rem 1rem",
          zIndex: 999,
          background: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Install App
      </button>
      {/* )} */}

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LoginPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
