import { createRoot } from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
