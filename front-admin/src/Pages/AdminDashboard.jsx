import React from "react";
import ImageCarousel from "../components/ImageCarousel";
import "../styles/AdminDashboard.css";

const dummyImages = [
  "https://via.placeholder.com/300x150?text=Foto+1",
  "https://via.placeholder.com/300x150?text=Foto+2",
  "https://via.placeholder.com/300x150?text=Foto+3",
];

const AdminDashboard = () => {
  return (
    <div className="admin-page">
      <div className="admin-navbar">
        <div className="logo">Logo</div>
        <div className="tabs">
          <button>Solicitudes</button>
          <button>Complejos Aprobados</button>
        </div>
        <div className="perfil">
          👤 Admin
          <button style={{ marginLeft: '10px' }}>Cerrar sesión</button>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-detail">
          <h2>Solicitud 1</h2>
          <ImageCarousel images={dummyImages} />
          <input placeholder="Calle" />
          <input placeholder="Altura" />
          <input placeholder="Porc. Reembolso" />
          <input placeholder="Horario" />
          <input placeholder="Descripción" />
          <input placeholder="CUIT" />
          <div className="admin-buttons">
            <button className="btn-decline">Decline</button>
            <button className="btn-approve">Approved</button>
          </div>
        </div>

        <div className="admin-list">
          {[2, 3, 4, 5, 6, 7].map((id) => (
            <div key={id} className="request-card">
              Solicitud {id}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
