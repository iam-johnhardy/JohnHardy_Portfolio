
import React, { useState, useEffect } from "react";

 function ExchangeRate () {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("promoClosed")) setOpen(false);
  }, []);

  if (!open) return null;

  return (
    <div className="bg-blue- text-white text-xs relative ">
      <div className="max-w-7xl mx-auto px-4 py-2 flex justify-center items-center">
        <p className="animate-marquee whitespace-nowrap text-center font-inter">
          PROMO!!!&nbsp;&nbsp;PROMO!!!&nbsp;&nbsp;PROMO!!!&nbsp;&nbsp;PROMO!!!
          &nbsp;&nbsp;PROMO!!!&nbsp;&nbsp;PROMO!!!
        </p>
        <button
          className="absolute right-4 lg:right-20 top-1/2 -translate-y-1/2 px-2"
          aria-label="close promo"
          onClick={() => {
            localStorage.setItem("promoClosed", "1");
            setOpen(false);
          }}
        >
          ✕
        </button>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 12s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default ExchangeRate
