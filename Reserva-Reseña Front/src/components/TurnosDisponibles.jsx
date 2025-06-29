function TurnosDisponibles({ turnosPorSemana, seleccionados, setSeleccionados }) {
  const toggleTurno = (dia, hora) => {
    const turnoCompleto = `${dia} - ${hora}`;
    const yaSeleccionado = seleccionados.includes(turnoCompleto);

    if (yaSeleccionado) {
      setSeleccionados(seleccionados.filter(t => t !== turnoCompleto));
    } else {
      if (seleccionados.length >= 2) {
        alert("Solo se pueden seleccionar hasta 2 turnos.");
        return;
      }
      setSeleccionados([...seleccionados, turnoCompleto]);
    }
  };

  return (
    <div className="semana-turnos">
      {turnosPorSemana.map((diaObj, i) => (
        <div key={i} className="dia-turnos">
          <h4>{diaObj.dia}</h4>
          <div className="grid-turnos">
            {diaObj.turnos.map((hora, j) => {
              const id = `${diaObj.dia} - ${hora}`;
              return (
                <button
                  key={j}
                  className={seleccionados.includes(id) ? 'turno seleccionado' : 'turno'}
                  onClick={() => toggleTurno(diaObj.dia, hora)}
                >
                  {hora}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TurnosDisponibles;