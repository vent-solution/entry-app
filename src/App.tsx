import { Routes, Route } from "react-router-dom";
import SignUpPage from "./modules/auth/signUpPage";
import Layout from "./components/Layout";
import LoginPage from "./modules/auth/loginPage";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "./app/store";
import { webSocketService } from "./webSockets/socketService";
import { usersTopicSubscription } from "./webSockets/subscriptionTopics/usersTopicSubscription";
import { getUserLocation } from "./global/api";

function App() {
  const dispatch = useDispatch<AppDispatch>();

  // socket connection and subscription
  useEffect(() => {
    webSocketService.connect();

    usersTopicSubscription();

    return () => {
      console.log("Unsubscribing from WebSocket...");
      webSocketService.unsubscribe("/topic/users");
      webSocketService.disconnect();
    };
  }, [dispatch]);

  useEffect(() => {
    getUserLocation();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LoginPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
      </Route>
    </Routes>
  );
}

export default App;
