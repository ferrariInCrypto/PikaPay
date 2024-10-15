// NavButton.tsx
import React from 'react';

interface NavButtonProps {
  active?: boolean; // Optional prop to indicate active state
  onClick: () => void; // Function to call on click
  children: React.ReactNode; // Content inside the button
}

const NavButton: React.FC<NavButtonProps> = ({ active = false, onClick, children }) => {
  return (
    <button 
      onClick={onClick} 
      className={`px-4 py-2 rounded-md text-white  font-Archivo transition-colors duration-300 
        ${active ? 'bg-gray-700' : 'bg-gray-400 hover:bg-gray-500'}`}
    >
      {children}
    </button>
  );
};

export default NavButton;
