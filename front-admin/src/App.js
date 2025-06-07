// import React, { useState } from 'react';
// import './App.css';

// function App() {
//   const [contador, setContador] = useState(0);

//   const aumentar = () => setContador(contador + 1);
//   const disminuir = () => setContador(contador - 1);

//   return (
//     <div className="App">
//       <h1>Contador en React</h1>
//       <p className="contador-texto">Valor actual: {contador}</p>
//       <div className="botones">
//         <button className="boton" onClick={disminuir}>- Restar</button>
//         <button className="boton" onClick={aumentar}>+ Sumar</button>
//       </div>
//     </div>
//   );
// }

// export default App;



// import React from 'react';
// import './App.css';
// import TarjetaInfo from './TarjetaInfo';

// function App() {
//   return (
//     <div className="App">
//       <h1>Tarjetas con Props</h1>
//       <div className="tarjetas-contenedor">
//         <TarjetaInfo
//           titulo="React"
//           descripcion="Librería para construir interfaces de usuario."
//           colorFondo="#007acc"
//         />
//         <TarjetaInfo
//           titulo="JavaScript"
//           descripcion="Lenguaje de programación para la web."
//           colorFondo="#f7df1e"
//         />
//         <TarjetaInfo
//           titulo="CSS"
//           descripcion="Estilos para tu sitio web."
//           colorFondo="#264de4"
//         />
//       </div>
//     </div>
//   );
// }

// export default App;


import React from "react";
import AdminDashboard from "./Pages/AdminDashboard";

function App() {
  return <AdminDashboard />;
}

export default App;
