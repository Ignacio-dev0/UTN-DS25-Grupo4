#!/bin/bash

# Lista de archivos que necesitan el import de API_BASE_URL
files=(
    "src/pages/SignUpPage.jsx"
    "src/pages/MisReservasPage.jsx"
    "src/pages/EstadoSolicitudPage.jsx"
    "src/pages/EditarCanchaPage.jsx"
    "src/components/ServiciosSelector.jsx"
    "src/components/GestionDeportes.jsx"
    "src/components/ListaCanchasComplejo.jsx"
    "src/components/CanchaCard.jsx"
    "src/components/ComplejoInfo.jsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        # Verificar si ya tiene el import
        if ! grep -q "API_BASE_URL" "$file"; then
            echo "Agregando import a $file"
            # Buscar la línea de import más relevante para insertar después
            if grep -q "import.*from.*react" "$file"; then
                # Insertar después del último import de React
                sed -i '' '/import.*from.*react/a\
import { API_BASE_URL } from '"'"'../config/api.js'"'"';
' "$file"
            else
                # Si no hay imports de React, agregar al principio
                sed -i '' '1i\
import { API_BASE_URL } from '"'"'../config/api.js'"'"';
' "$file"
            fi
        fi
    fi
done