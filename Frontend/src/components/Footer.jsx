import React, { useEffect, useState } from "react";

export const Footer = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id); // Cleanup on unmount
  }, []);

  return (
    <footer className="fixed bottom-0 left-0 w-full text-center p-3 bg-blue-500 border-r text-white">
      &copy; {now.getFullYear()} John Hardy. All rights reserved. — {now.toLocaleTimeString()}⏰
    </footer>
  );
};