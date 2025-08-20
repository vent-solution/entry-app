import { configureStore } from "@reduxjs/toolkit";
import alertReducer from "../other/alertSlice";
import confirmReducer from "../other/ConfirmSlice";
import actionReducer from "../global/actions/actionSlice";
import settingsReducer from "../modules/settings/SettingsSlice";
import currencyExchangeReducer from "../other/apis/CurrencyExchangeSlice";

export const store = configureStore({
  reducer: {
    alert: alertReducer,
    confirm: confirmReducer,
    action: actionReducer,
    settings: settingsReducer,
    currencyExchange: currencyExchangeReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
