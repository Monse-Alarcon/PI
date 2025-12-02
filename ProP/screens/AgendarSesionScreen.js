import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { getUserById } from '../utils/database';
import { insertSesion, updateSesion, getMaestros, getMateriasByMaestro, getAllMaterias, getMaestrosByMateria, verificarSesionExistente } from '../utils/database';
import CustomHeader from '../components/CustomHeader';

const { width } = Dimensions.get('window');

export default function AgendarSesionScreen({ navigation, route }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [selectedMateria, setSelectedMateria] = useState(null);
  const [selectedMaestro, setSelectedMaestro] = useState(null);
  const [maestros, setMaestros] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [maestrosFiltrados, setMaestrosFiltrados] = useState([]);
  const [maestrosConMaterias, setMaestrosConMaterias] = useState([]);
  const [showMateriaSelector, setShowMateriaSelector] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [sesionId, setSesionId] = useState(null);
  const selectorHeight = useRef(new Animated.Value(0)).current;

  const currentUserId = route?.params?.usuarioId || navigation?.currentUserId;

  useEffect(() => {
    cargarDatos();
    generarCalendario();
    // Si hay una sesión para editar, cargar sus datos
    if (route?.params?.sesionEdit) {
      cargarSesionEdit(route.params.sesionEdit);
    }
  }, []);

  useEffect(() => {
    generarCalendario();
  }, [currentMonth]);

  useEffect(() => {
    if (selectedMateria) {
      cargarMaestrosPorMateria(selectedMateria);
    } else {
      cargarTodosLosMaestros();
    }
  }, [selectedMateria]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      if (currentUserId) {
        const u = await getUserById(currentUserId);
        if (u) setUsuario(u);
      }
      
      // Cargar todas las materias disponibles
      const todasMaterias = await getAllMaterias();
      setMaterias(todasMaterias);
      
      // Cargar todos los maestros
      await cargarTodosLosMaestros();
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarSesionEdit = async (sesion) => {
    try {
      setIsEditing(true);
      setSesionId(sesion.id);
      
      // Establecer materia seleccionada
      if (sesion.materia) {
        setSelectedMateria(sesion.materia);
      }
      
      // Establecer maestro seleccionado
      if (sesion.tutorId) {
        const todosMaestros = await getMaestros();
        const maestro = todosMaestros.find(m => m.id === sesion.tutorId);
        if (maestro) {
          setSelectedMaestro(maestro);
          const materiasMaestro = await getMateriasByMaestro(maestro.id);
          const maestrosConMateriasData = await Promise.all(
            todosMaestros.map(async (m) => {
              const materiasM = await getMateriasByMaestro(m.id);
              return { ...m, materias: materiasM };
            })
          );
          setMaestrosConMaterias(maestrosConMateriasData);
        }
      }
      
      // Establecer fecha
      if (sesion.fecha) {
        const fecha = new Date(sesion.fecha);
        setSelectedDate(fecha);
        setCurrentMonth(new Date(fecha.getFullYear(), fecha.getMonth(), 1));
      }
      
      // Establecer hora
      if (sesion.hora) {
        setSelectedTime(sesion.hora);
      }
    } catch (error) {
      console.error('Error al cargar sesión para editar:', error);
    }
  };

  const cargarTodosLosMaestros = async () => {
    try {
      const todosMaestros = await getMaestros();
      setMaestros(todosMaestros);
      setMaestrosFiltrados(todosMaestros);
      
      // Cargar materias de cada maestro
      const maestrosConMateriasData = await Promise.all(
        todosMaestros.map(async (maestro) => {
          const materiasMaestro = await getMateriasByMaestro(maestro.id);
          return { ...maestro, materias: materiasMaestro };
        })
      );
      setMaestrosConMaterias(maestrosConMateriasData);
    } catch (error) {
      console.error('Error al cargar maestros:', error);
    }
  };

  const cargarMaestrosPorMateria = async (materia) => {
    try {
      const maestrosMateria = await getMaestrosByMateria(materia);
      setMaestrosFiltrados(maestrosMateria);
      
      // Cargar materias de cada maestro
      const maestrosConMateriasData = await Promise.all(
        maestrosMateria.map(async (maestro) => {
          const materiasMaestro = await getMateriasByMaestro(maestro.id);
          return { ...maestro, materias: materiasMaestro };
        })
      );
      setMaestrosConMaterias(maestrosConMateriasData);
    } catch (error) {
      console.error('Error al cargar maestros por materia:', error);
    }
  };

  const generarCalendario = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Días del mes anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        month: month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false,
      });
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month: month,
        year: year,
        isCurrentMonth: true,
      });
    }

    // Días del mes siguiente para completar la semana
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        month: month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false,
      });
    }

    setCalendarDays(days);
  };

  const handleDateSelect = (day) => {
    if (day.isCurrentMonth) {
      const date = new Date(day.year, day.month, day.day);
      setSelectedDate(date);
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleMateriaSelect = (materia) => {
    setSelectedMateria(materia);
    // Si hay un maestro seleccionado, verificar que imparta esta materia
    if (selectedMaestro) {
      const materiasMaestro = maestrosConMaterias.find(m => m.id === selectedMaestro.id)?.materias || [];
      if (!materiasMaestro.includes(materia)) {
        setSelectedMaestro(null); // Reset maestro si no imparte esta materia
      }
    }
    toggleMateriaSelector();
  };

  const toggleMateriaSelector = () => {
    const toValue = showMateriaSelector ? 0 : 1;
    Animated.timing(selectorHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setShowMateriaSelector(!showMateriaSelector);
  };

  const handleMaestroSelect = async (maestro) => {
    setSelectedMaestro(maestro);
    // Cargar materias del maestro seleccionado
    try {
      const materiasMaestro = await getMateriasByMaestro(maestro.id);
      // Si hay una materia seleccionada pero no está en las materias del maestro, limpiarla
      if (selectedMateria && !materiasMaestro.includes(selectedMateria)) {
        setSelectedMateria(null);
      }
      // Si no hay materia seleccionada y el maestro tiene materias, seleccionar la primera
      if (!selectedMateria && materiasMaestro.length > 0) {
        setSelectedMateria(materiasMaestro[0]);
      }
    } catch (error) {
      console.error('Error al cargar materias del maestro:', error);
    }
  };

  const handleConfirm = async () => {
    if (!selectedMateria) {
      Alert.alert('Error', 'Por favor selecciona una materia');
      return;
    }

    if (!selectedMaestro) {
      Alert.alert('Error', 'Por favor selecciona un maestro');
      return;
    }

    if (!selectedDate) {
      Alert.alert('Error', 'Por favor selecciona una fecha');
      return;
    }

    if (!selectedTime) {
      Alert.alert('Error', 'Por favor selecciona una hora');
      return;
    }

    if (!currentUserId) {
      Alert.alert('Error', 'No se pudo identificar al usuario');
      return;
    }

    try {
      // Combinar fecha y hora
      const timeParts = selectedTime.split(' ');
      const [timeStr, period] = timeParts.length === 2 ? [timeParts[0], timeParts[1]] : [selectedTime, 'AM'];
      const [hoursStr, minutesStr] = timeStr.split(':');
      let h = parseInt(hoursStr, 10);
      const m = parseInt(minutesStr || '0', 10);
      
      if (period === 'PM' && h !== 12) {
        h += 12;
      } else if (period === 'AM' && h === 12) {
        h = 0;
      }
      
      const fechaHora = new Date(selectedDate);
      fechaHora.setHours(h, m, 0, 0);

      // Verificar si ya existe una sesión con el mismo maestro, fecha y hora
      const sesionExistente = await verificarSesionExistente(
        selectedMaestro.id,
        fechaHora.toISOString(),
        selectedTime,
        isEditing ? sesionId : null // Excluir la sesión actual si estamos editando
      );

      if (sesionExistente) {
        Alert.alert(
          'Error',
          'Ya existe una sesión agendada con este maestro en la misma fecha y hora. Por favor selecciona otra fecha u hora.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (isEditing && sesionId) {
        // Actualizar sesión existente
        await updateSesion(sesionId, {
          tutorId: selectedMaestro.id,
          materia: selectedMateria,
          fecha: fechaHora.toISOString(),
          hora: selectedTime,
          estado: 'pendiente',
        });

        Alert.alert(
          'Éxito',
          'Sesión actualizada correctamente',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        // Crear nueva sesión
        await insertSesion({
          usuarioId: currentUserId,
          tutorId: selectedMaestro.id,
          materia: selectedMateria,
          fecha: fechaHora.toISOString(),
          hora: selectedTime,
          estado: 'pendiente',
        });

        Alert.alert(
          'Éxito',
          'Sesión agendada correctamente',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error al agendar sesión:', error);
      Alert.alert('Error', 'No se pudo agendar la sesión. Intenta de nuevo.');
    }
  };

  const cambiarMes = (direccion) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direccion, 1));
  };

  const timeSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
  ];

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const isDateSelected = (day) => {
    if (!selectedDate || !day.isCurrentMonth) return false;
    return (
      day.day === selectedDate.getDate() &&
      day.month === selectedDate.getMonth() &&
      day.year === selectedDate.getFullYear()
    );
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day.isCurrentMonth &&
      day.day === today.getDate() &&
      day.month === today.getMonth() &&
      day.year === today.getFullYear()
    );
  };

  const nombreCompleto = usuario 
    ? `${usuario.name || ''}`.trim() || 'Usuario'
    : 'Usuario';

  return (
    <View style={styles.container}>
      <CustomHeader 
        navigation={navigation} 
        title={isEditing ? 'Editar sesión' : 'Agendar sesión'} 
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Instruction Text */}
        <Text style={styles.instructionText}>
          Selecciona la fecha y hora que se acomode a tu horario
        </Text>

        {/* User Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>👤</Text>
            <Text style={styles.infoText}>{nombreCompleto}</Text>
          </View>
        </View>

        {/* Materia Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📚</Text>
            <Text style={styles.sectionTitle}>Selecciona una materia</Text>
          </View>
          
          <Animated.View
            style={[
              styles.selectorContainerWrapper,
              {
                maxHeight: selectorHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 250],
                }),
                opacity: selectorHeight,
                overflow: 'hidden',
              },
            ]}
          >
            <ScrollView 
              style={styles.selectorContainer}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
            >
              {materias.map((m, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.selectorItem,
                    selectedMateria === m && styles.selectorItemSelected,
                  ]}
                  onPress={() => handleMateriaSelect(m)}
                >
                  <Text
                    style={[
                      styles.selectorItemText,
                      selectedMateria === m && styles.selectorItemTextSelected,
                    ]}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          <TouchableOpacity
            style={styles.selectorButton}
            onPress={toggleMateriaSelector}
          >
            <Text style={styles.selectorButtonText}>
              {selectedMateria || 'Selecciona una materia'}
            </Text>
            <Animated.Text
              style={[
                styles.selectorButtonIcon,
                {
                  transform: [
                    {
                      rotate: selectorHeight.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '180deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              ▼
            </Animated.Text>
          </TouchableOpacity>

          {selectedMateria && (
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedInfoText}>
                Materia seleccionada: <Text style={styles.selectedInfoBold}>{selectedMateria}</Text>
              </Text>
            </View>
          )}
        </View>

        {/* Maestros List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>👨‍🏫</Text>
            <Text style={styles.sectionTitle}>
              {selectedMateria ? `Maestros de ${selectedMateria}` : 'Todos los maestros'}
            </Text>
          </View>

          {loading ? (
            <Text style={styles.loadingText}>Cargando maestros...</Text>
          ) : maestrosFiltrados.length === 0 ? (
            <Text style={styles.emptyText}>No hay maestros disponibles</Text>
          ) : (
            <View style={styles.maestrosList}>
              {maestrosConMaterias.map((maestro) => {
                const isSelected = selectedMaestro?.id === maestro.id;
                const materiasMaestro = maestro.materias || [];
                return (
                  <TouchableOpacity
                    key={maestro.id}
                    style={[
                      styles.maestroCard,
                      isSelected && styles.maestroCardSelected,
                    ]}
                    onPress={() => handleMaestroSelect(maestro)}
                  >
                    <View style={styles.maestroCardContent}>
                      <Text style={styles.maestroName}>{maestro.name}</Text>
                      <Text style={styles.maestroEmail}>{maestro.email}</Text>
                      {maestro.edificio && (
                        <Text style={styles.maestroEdificio}>
                          📍 Edificio: {maestro.edificio}
                        </Text>
                      )}
                      {materiasMaestro.length > 0 && (
                        <View style={styles.materiasContainer}>
                          <Text style={styles.materiasLabel}>Materias:</Text>
                          <View style={styles.materiasTags}>
                            {materiasMaestro.map((materia, idx) => (
                              <View key={idx} style={styles.materiaTag}>
                                <Text style={styles.materiaTagText}>{materia}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                    {isSelected && (
                      <Text style={styles.selectedCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {selectedMaestro && (
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedInfoText}>
                Maestro seleccionado: <Text style={styles.selectedInfoBold}>{selectedMaestro.name}</Text>
              </Text>
            </View>
          )}
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📅</Text>
            <Text style={styles.sectionTitle}>Seleccionar una fecha</Text>
          </View>

          {/* Calendar Navigation */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => cambiarMes(-1)} style={styles.monthButton}>
              <Text style={styles.monthButtonText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <TouchableOpacity onPress={() => cambiarMes(1)} style={styles.monthButton}>
              <Text style={styles.monthButtonText}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendar}>
            {/* Week Days Header */}
            <View style={styles.weekDaysRow}>
              {weekDays.map((day, index) => (
                <View key={index} style={styles.weekDay}>
                  <Text style={styles.weekDayText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Days */}
            <View style={styles.calendarGrid}>
              {calendarDays.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.calendarDay,
                    !day.isCurrentMonth && styles.calendarDayDisabled,
                    isToday(day) && styles.calendarDayToday,
                    isDateSelected(day) && styles.calendarDaySelected,
                  ]}
                  onPress={() => handleDateSelect(day)}
                  disabled={!day.isCurrentMonth}
                >
                  <Text
                    style={[
                      styles.calendarDayText,
                      !day.isCurrentMonth && styles.calendarDayTextDisabled,
                      isDateSelected(day) && styles.calendarDayTextSelected,
                    ]}
                  >
                    {day.day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🕐</Text>
            <Text style={styles.sectionTitle}>Selecciona una hora</Text>
          </View>

          <View style={styles.timeGrid}>
            {timeSlots.map((time, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.timeSlot,
                  selectedTime === time && styles.timeSlotSelected,
                ]}
                onPress={() => handleTimeSelect(time)}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    selectedTime === time && styles.timeSlotTextSelected,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmButtonText}>
            {isEditing ? 'Guardar cambios' : 'Confirmar'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E6D3',
  },
  header: {
    backgroundColor: '#8B4513',
    paddingTop: 18,
    paddingBottom: 22,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  menuButton: {
    position: 'absolute',
    left: 12,
    top: 8,
    zIndex: 40,
  },
  backArrowButton: {
    position: 'absolute',
    right: 12,
    top: 18,
    zIndex: 40,
    padding: 8,
  },
  backArrowText: {
    fontSize: 28,
    color: '#FFF',
    fontWeight: 'bold',
  },
  logo: {
    width: 60,
    height: 60,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: width * 0.7,
    height: '100%',
    backgroundColor: '#8B4513',
    zIndex: 100,
    paddingTop: 20,
  },
  drawerContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#A0826D',
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D4AF9F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  profileText: {
    fontSize: 28,
  },
  profileLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  menuBottom: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 24,
  },
  settingsIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#A0826D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsText: {
    fontSize: 24,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 99,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  instructionText: {
    fontSize: 14,
    color: '#8B4513',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#8B4513',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  monthButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D4AF9F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthButtonText: {
    fontSize: 24,
    color: '#8B4513',
    fontWeight: 'bold',
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  calendar: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0C8B8',
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B4513',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    margin: 2,
  },
  calendarDayDisabled: {
    opacity: 0.3,
  },
  calendarDayToday: {
    backgroundColor: '#E0C8B8',
  },
  calendarDaySelected: {
    backgroundColor: '#8B4513',
  },
  calendarDayText: {
    fontSize: 14,
    color: '#8B4513',
    fontWeight: '500',
  },
  calendarDayTextDisabled: {
    color: '#999',
  },
  calendarDayTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlot: {
    backgroundColor: '#F5E6D3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E0C8B8',
    minWidth: '30%',
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#8B4513',
    fontWeight: '500',
  },
  timeSlotTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#8B4513',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
    alignSelf: 'flex-end',
    minWidth: 120,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectorContainerWrapper: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0C8B8',
    marginBottom: 8,
  },
  selectorContainer: {
    padding: 8,
  },
  selectorButton: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0C8B8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorButtonText: {
    fontSize: 16,
    color: '#8B4513',
    fontWeight: '500',
  },
  selectorButtonIcon: {
    fontSize: 12,
    color: '#8B4513',
  },
  selectorItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#F5E6D3',
  },
  selectorItemSelected: {
    backgroundColor: '#8B4513',
  },
  selectorItemText: {
    fontSize: 15,
    color: '#8B4513',
    fontWeight: '500',
  },
  selectorItemTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  selectedInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#D4AF9F',
    borderRadius: 8,
  },
  selectedInfoText: {
    fontSize: 14,
    color: '#8B4513',
  },
  selectedInfoBold: {
    fontWeight: 'bold',
    color: '#8B4513',
  },
  maestrosList: {
    gap: 12,
  },
  maestroCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E0C8B8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  maestroCardSelected: {
    borderColor: '#8B4513',
    backgroundColor: '#F5E6D3',
  },
  maestroCardContent: {
    flex: 1,
  },
  maestroName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  maestroEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  maestroEdificio: {
    fontSize: 13,
    color: '#8B4513',
  },
  selectedCheck: {
    fontSize: 24,
    color: '#8B4513',
    fontWeight: 'bold',
    marginLeft: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#8B4513',
    textAlign: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  materiasContainer: {
    marginTop: 8,
  },
  materiasLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 6,
  },
  materiasTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  materiaTag: {
    backgroundColor: '#D4AF9F',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  materiaTagText: {
    fontSize: 12,
    color: '#8B4513',
    fontWeight: '500',
  },
});

