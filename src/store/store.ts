import { configureStore } from '@reduxjs/toolkit'
import { contactApi } from '../services/contactApi'

export const store = configureStore({
  reducer: {
    [contactApi.reducerPath]: contactApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(contactApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch