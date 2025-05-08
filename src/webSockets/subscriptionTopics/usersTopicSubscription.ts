import { webSocketService } from "../socketService";

export const usersTopicSubscription = () => {
  webSocketService.subscribe("/topic/users", (__message) => {
    // const content = JSON.parse(JSON.stringify(message.content));
  });
};
