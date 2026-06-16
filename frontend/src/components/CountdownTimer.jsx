import { useState, useEffect } from 'react';

const CountdownTimer = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const diff = new Date(endTime) - new Date();

      if (diff <= 0) {
        setTimeLeft('Auction ended');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  const isEnded = timeLeft === 'Auction ended';

  return (
    <div
      className={`text-center p-4 rounded-lg ${
        isEnded ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'
      }`}
    >
      <p className="text-sm font-medium">{isEnded ? 'Status' : 'Time Remaining'}</p>
      <p className="text-2xl font-bold mt-1">{timeLeft}</p>
    </div>
  );
};

export default CountdownTimer;
