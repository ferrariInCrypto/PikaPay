import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./Main";
import { Root } from "./Root";
import toast, { Toaster } from 'react-hot-toast';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
    ],
  },
]);

function App() {
  return (
    <>
         <Toaster />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
