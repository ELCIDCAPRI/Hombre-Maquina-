import streamlit as st
import pandas as pd

# Configuración de la página web accesible
st.set_page_config(page_title="Optimización Hombre-Máquina", layout="wide")

st.title("Sistema de Optimización: Diagrama Hombre-Máquina")
st.write("Proyecto accesible en la nube para el cálculo de eficiencia y costos mínimos de producción.")

# ---------------------------------------------------------
# PANEL LATERAL: ENTRADA DE DATOS (ACCESIBILIDAD DE PARÁMETROS)
# ---------------------------------------------------------
st.sidebar.header("Parámetros del Ciclo de Trabajo")

tiempo_cargar = st.sidebar.number_input("Tiempo de Carga / Preparación (min)", min_value=0.1, value=2.0, step=0.1)
tiempo_maquinado = st.sidebar.number_input("Tiempo de Maquinado / Hacer (min)", min_value=0.1, value=5.0, step=0.1)
tiempo_descargar = st.sidebar.number_input("Tiempo de Descarga / Retirar (min)", min_value=0.1, value=1.0, step=0.1)

st.sidebar.header("Parámetros Económicos (Costos)")
costo_operador = st.sidebar.number_input("Costo del Operador ($/hora)", min_value=1.0, value=10.0, step=0.5)
costo_maquina = st.sidebar.number_input("Costo de la Máquina ($/hora)", min_value=1.0, value=20.0, step=0.5)

# ---------------------------------------------------------
# CÁLCULOS MATEMÁTICOS DEL DIAGRAMA
# ---------------------------------------------------------
# Tiempos base
tiempo_servicio = tiempo_cargar + tiempo_descargar
ciclo_ideal = tiempo_servicio + tiempo_maquinado

# Cálculo técnico del número óptimo de máquinas (N)
N_teorico = ciclo_ideal / tiempo_servicio
N_bajo = int(N_teorico)
N_alto = N_bajo + 1

# ---------------------------------------------------------
# PRESENTACIÓN DE RESULTADOS EN LA INTERFAZ
# ---------------------------------------------------------
col1, col2 = st.columns(2)

with col1:
    st.subheader("Análisis de Tiempos del Ciclo")
    st.write(f"Tiempo total de servicio del operario: {tiempo_servicio:.2f} minutos")
    st.write(f"Tiempo de ciclo independiente de la máquina: {tiempo_maquinado:.2f} minutos")
    st.write(f"Número teórico ideal de máquinas asignables: {N_teorico:.2f}")

with col2:
    st.subheader("Criterio Económico de Decisión")
    
    # Evaluar costos para N bajo (Operador con tiempo muerto)
    ciclo_N_bajo = ciclo_ideal
    costo_pieza_bajo = ((costo_operador + N_bajo * costo_maquina) * (ciclo_N_bajo / 60)) / N_bajo
    
    # Evaluar costos para N alto (Máquinas con tiempo muerto)
    ciclo_N_alto = N_alto * tiempo_servicio
    costo_pieza_alto = ((costo_operador + N_alto * costo_maquina) * (ciclo_N_alto / 60)) / N_alto
    
    # Determinar la mejor opción económica
    if costo_pieza_bajo < costo_pieza_alto:
        mejor_opcion = N_bajo
        costo_minimo = costo_pieza_bajo
        explicacion = "Es más rentable que el operador tenga tiempo de ocio a que las máquinas se detengan."
    else:
        mejor_opcion = N_alto
        costo_minimo = costo_pieza_alto
        explicacion = "Es más rentable saturar al operador y permitir que las máquinas esperen un momento."

    st.write(f"Costo por pieza con {N_bajo} máquina(s): ${costo_pieza_bajo:.4f}")
    st.write(f"Costo por pieza con {N_alto} máquina(s): ${costo_pieza_alto:.4f}")

# Resumen ejecutivo destacado
st.info(f"Decisión Óptima: Asignar exactamente {mejor_opcion} máquina(s) por operario de acuerdo al costo mínimo de ${costo_minimo:.4f} por unidad. {explicacion}")

# ---------------------------------------------------------
# SIMULACIÓN DEL DIAGRAMA LÍNEA POR LÍNEA
# ---------------------------------------------------------
st.subheader("Simulación Temporal del Diagrama Hombre-Máquina")

datos_diagrama = {
    "Actividad": ["Carga / Preparación", "Maquinado Activo", "Descarga / Retiro"],
    "Estado del Operario": ["Ocupado (Servicio)", "Libre / Ocio", "Ocupado (Servicio)"],
    "Estado de la Máquina": ["Ocupada (Carga)", "Operando Sola", "Ocupada (Descarga)"],
    "Duración (min)": [tiempo_cargar, tiempo_maquinado, tiempo_descargar]
}

df_diagrama = pd.DataFrame(datos_diagrama)
st.table(df_diagrama)
