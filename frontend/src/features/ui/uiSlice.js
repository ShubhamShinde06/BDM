import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: { sidebarOpen: true },
  reducers: {
    toggleSidebar: (s) => { s.sidebarOpen = !s.sidebarOpen; },
    setSidebar: (s, { payload }) => { s.sidebarOpen = payload; },
  },
});

export const { toggleSidebar, setSidebar } = uiSlice.actions;
export const selectSidebar = (s) => s.ui.sidebarOpen;
export default uiSlice.reducer;
