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

  // Handle beforeinstallprompt event
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Delay showing the install button
      setTimeout(() => {
        setPromptReady(true);
      }, 1000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  // Handle app installation
  useEffect(() => {
    window.addEventListener("appinstalled", () => {
      setDeferredPrompt(null);
      setPromptReady(false);
    });
  }, []);

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
      {/* Manual Install Button */}
      {promptReady && deferredPrompt && (
        <button
          onClick={() => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult: any) => {
              console.log("User choice:", choiceResult.outcome);
              setDeferredPrompt(null);
              setPromptReady(false);
            });
          }}
          className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-10 h-fit"
        >
          Install App
        </button>
      )}

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
