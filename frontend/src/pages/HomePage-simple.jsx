import React from 'react';

function HomePage() {
  return (
    <div style={{padding: '20px'}}>
      <h1 style={{color: 'green', fontSize: '32px', textAlign: 'center'}}>
        ¡Bienvenido a CanchaYa!
      </h1>
      <p style={{fontSize: '18px', textAlign: 'center', marginTop: '20px'}}>
        La aplicación está funcionando correctamente.
      </p>
      <div style={{textAlign: 'center', marginTop: '40px'}}>
        <p>Frontend: ✅ Funcionando</p>
        <p>Backend: ✅ Funcionando</p>
        <p>Routing: ✅ Funcionando</p>
      </div>
    </div>
  );
}

export default HomePage;
