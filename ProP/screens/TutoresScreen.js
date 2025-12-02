import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  ActivityIndicator,
  Animated,
  TextInput,
} from 'react-native';
import CustomHeader from '../components/CustomHeader';
import { getMaestros, getMateriasByMaestro, getCalificacionPromedioPorTutorMateria } from '../utils/database';

const { width } = Dimensions.get('window');

export default function TutoresScreen({ navigation, route }) {
  const [tutores, setTutores] = useState([]);
  const [tutoresFiltrados, setTutoresFiltrados] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnimation] = useState(new Animated.Value(-width * 0.7));
  const currentUserId = route?.params?.usuarioId || navigation?.currentUserId;

  useEffect(() => {
    cargarTutores();
  }, []);

  const toggleMenu = () => {
    if (menuOpen) {
      Animated.timing(menuAnimation, {
        toValue: -width * 0.7,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setMenuOpen(false);
    } else {
      Animated.timing(menuAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setMenuOpen(true);
    }
  };

  const cargarTutores = async () => {
    try {
      setLoading(true);
      const maestros = await getMaestros();
      
      // Cargar materias y calificaciones para cada tutor
      const tutoresConDatos = await Promise.all(
        maestros.map(async (maestro) => {
          const materias = await getMateriasByMaestro(maestro.id);
          
          // Obtener calificación promedio por materia
          const materiasConCalificacion = await Promise.all(
            materias.map(async (materia) => {
              const calificacion = await getCalificacionPromedioPorTutorMateria(maestro.id, materia);
              return { materia, calificacion };
            })
          );

          // Calcular calificación promedio general
          const calificaciones = materiasConCalificacion.map(m => m.calificacion).filter(c => c > 0);
          const promedioGeneral = calificaciones.length > 0
            ? (calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length).toFixed(1)
            : '0';

          return {
            ...maestro,
            materias: materiasConCalificacion,
            calificacionPromedio: parseFloat(promedioGeneral),
          };
        })
      );

      // Ordenar por calificación promedio (mayor a menor)
      tutoresConDatos.sort((a, b) => b.calificacionPromedio - a.calificacionPromedio);
      
      setTutores(tutoresConDatos);
      setTutoresFiltrados(tutoresConDatos);
    } catch (error) {
      console.error('Error al cargar tutores:', error);
      Alert.alert('Error', 'No se pudieron cargar los tutores');
    } finally {
      setLoading(false);
    }
  };

  const filtrarTutores = (texto) => {
    setSearchText(texto);
    
    if (texto.trim() === '') {
      setTutoresFiltrados(tutores);
      return;
    }

    const textoLower = texto.toLowerCase();
    const filtrados = tutores.map(tutor => {
      // Filtrar las materias que coincidan con la búsqueda
      const materiasFiltradas = tutor.materias.filter(materiaData => 
        materiaData.materia.toLowerCase().includes(textoLower) ||
        tutor.name.toLowerCase().includes(textoLower)
      );

      if (materiasFiltradas.length > 0) {
        return {
          ...tutor,
          materias: materiasFiltradas
        };
      }
      return null;
    }).filter(tutor => tutor !== null);

    setTutoresFiltrados(filtrados);
  };

  const handleTutorPress = (tutor) => {
    // Navegar al perfil del tutor
    navigation.navigate('PerfilTutor', {
      usuarioId: currentUserId,
      tutorId: tutor.id,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Cargando tutores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Hamburger Menu Overlay */}
      {menuOpen && (
        <TouchableOpacity
          style={styles.menuOverlay}
          onPress={toggleMenu}
          activeOpacity={0.8}
        />
      )}

      {/* Animated Drawer Menu */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX: menuAnimation }],
          },
        ]}
      >
        <View style={styles.drawerContent}>
          <View style={styles.profileSection}>
            <View style={styles.profileIcon}>
              <Text style={styles.profileText}>👤</Text>
            </View>
            <Text style={styles.profileLabel}>Usuario</Text>
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              navigation.navigate('Home');
            }}
          >
            <Text style={styles.menuItemText}>Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              navigation.navigate('MiAgenda', { usuarioId: currentUserId });
            }}
          >
            <Text style={styles.menuItemText}>Mis agendas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              navigation.navigate('Tutores', { usuarioId: currentUserId });
            }}
          >
            <Text style={styles.menuItemText}>Tutores</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              navigation.navigate('Perfil');
            }}
          >
            <Text style={styles.menuItemText}>Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              navigation.navigate('Logout');
            }}
          >
            <Text style={styles.menuItemText}>Cerrar sesión</Text>
          </TouchableOpacity>

          <View style={styles.menuBottom}>
            <TouchableOpacity style={styles.settingsIcon}>
              <Text style={styles.settingsText}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Header */}
      <CustomHeader navigation={navigation} title="Tutores" showBackButton={true} />

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o materia..."
          placeholderTextColor="#A0826D"
          value={searchText}
          onChangeText={filtrarTutores}
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => filtrarTutores('')}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {tutoresFiltrados.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchText.length > 0 
                ? 'No se encontraron resultados' 
                : 'No hay tutores disponibles'}
            </Text>
          </View>
        ) : (
          tutoresFiltrados.map((tutor) => {
            // Mostrar cada tutor con todas sus materias
            return tutor.materias.map((materiaData, index) => (
              <View
                key={`${tutor.id}-${materiaData.materia}-${index}`}
                style={styles.tutorCard}
              >
                <TouchableOpacity
                  style={styles.tutorCardContent}
                  onPress={() => handleTutorPress(tutor)}
                  activeOpacity={0.7}
                >
                  <View style={styles.tutorContent}>
                    <Text style={styles.tutorName}>{tutor.name}</Text>
                    <Text style={styles.tutorSubject}>Materia: {materiaData.materia}</Text>
                  </View>
                  <View style={styles.tutorRating}>
                    <Text style={styles.starIcon}>⭐</Text>
                    <Text style={styles.ratingText}>
                      {materiaData.calificacion > 0 ? `${materiaData.calificacion}/5` : 'Sin calificar'}
                    </Text>
                    <Text style={styles.arrowIcon}></Text>
                  </View>
                </TouchableOpacity>
              </View>
            ));
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C9A878',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C9A878',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8B4513',
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  searchContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#8B4513',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 20,
    color: '#A0826D',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4513',
  },
  tutorCard: {
    backgroundColor: '#8B3A3A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#C9A878',
  },
  tutorCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tutorContent: {
    flex: 1,
  },
  tutorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  tutorSubject: {
    fontSize: 14,
    color: '#FFF',
  },
  tutorRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starIcon: {
    fontSize: 18,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C9A878',
  },
  arrowIcon: {
    fontSize: 20,
    color: '#C9A878',
    marginLeft: 4,
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
});

