//import React, { useEffect } from 'react';
import SelectedCompany from './Components/SelectCompany/SelectCompany';

const App: React.FC = () => {
  // useEffect(() => {
  //   const handleContextMenu = (event: MouseEvent) => {
  //     event.preventDefault();
  //   };

  //   document.addEventListener('contextmenu', handleContextMenu);

  //   return () => {
  //     document.removeEventListener('contextmenu', handleContextMenu);
  //   };
  // }, []);

  return (
    <div>
      <SelectedCompany />
    </div>
  );
}

export default App;
