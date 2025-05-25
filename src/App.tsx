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

  // PWA install prompt handling
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler as EventListener);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handler as EventListener
      );
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
        } else {
          console.log("User dismissed the install prompt");
        }
        setDeferredPrompt(null);
        setShowInstallButton(false);
      });
    }
  };

  // WebSocket connection and subscription
  useEffect(() => {
    webSocketService.connect();
    usersTopicSubscription();

    return () => {
      console.log("Unsubscribing from WebSocket...");
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
      {showInstallButton && (
        <button
          onClick={handleInstallClick}
          style={{
            position: "fixed",
            bottom: "1rem",
            right: "1rem",
            padding: "0.5rem 1rem",
            zIndex: 999,
          }}
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
