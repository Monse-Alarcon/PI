import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/LoginScreen';
import CuentaNuevaScreen from './screens/CuentaNuevaScreen';
import HomeScreen from './screens/HomeScreen';
import HomeTutorado from './screens2/HomeTutorado';
import PerfilScreen from './screens/PerfilScreen';
import PerfilScreenTutor from './screens2/PerfilScreen';
import EditarPerfilScreen from './screens/EditarPerfilScreen';
import { useEffect, useState } from 'react';
import { initDB, seedInitialUser, getUserByEmail, initSesionesTable, initMaestroMateriasTable, seedMaestrosAndMaterias, initCalificacionesTable, seedCalificaciones, seedAlumnos, initNotificacionesTable } from './utils/database';
import AgendarSesionScreen from './screens/AgendarSesionScreen';
import AgendarSesionScreenTutor from './screens2/AgendarSesionScreen';
import MiAgendaScreen from './screens/MiAgendaScreen';
import MiAgendaScreenTutor from './screens2/MiAgendaScreen';
import AgendaEditar from './screens2/AgendaEditar';
import CalificacionesScreen from './screens2/CalificacionesScreen';
import NotificacionesScreen from './screens/NotificacionesScreen';
import NotificacionesTutoradoScreen from './screens/NotificacionesTutoradoScreen';
import RecuperarContrasenaScreen from './screens/RecuperarContrasenaScreen';
import TutoresScreen from './screens/TutoresScreen';
import TutoresScreenTutor from './screens2/TutoresScreen';
import CalificarScreen from './screens/CalificarScreen';
import CalificarScreenTutor from './screens2/CalificarScreen';
import SolicitudesScreen from './screens2/SolicitudesScreen';
import PerfilTutorScreen from './screens/PerfilTutorScreen';
import PerfilTutorScreenTutor from './screens2/PerfilTutorScreen';
import AlumnosScreen from './screens2/AlumnosScreen';
import PerfilAlumnoScreen from './screens/PerfilAlumnoScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome'); // 'welcome', 'login', 'signup', 'home'
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userType, setUserType] = useState(null); // 'Tutor' | 'Tutorado' | null
  const [screenParams, setScreenParams] = useState({});
  const [miAgendaRefreshKey, setMiAgendaRefreshKey] = useState(0);

  useEffect(() => {
    // initialize DB and seed a known user
    (async () => {
      try {
        await initDB();
        await initSesionesTable();
        await initMaestroMateriasTable();
        await initCalificacionesTable();
        await initNotificacionesTable();
        await seedInitialUser();
        await seedAlumnos();
        await seedMaestrosAndMaterias();
        await seedCalificaciones();
        // check persisted session
        try {
          const stored = await AsyncStorage.getItem('currentUserId');
          if (stored) {
            const id = parseInt(stored, 10);
            // verify user exists
            // getUserByEmail not useful for id; query by email not available here, but we trust id
            setCurrentUserId(id);
            setCurrentScreen('home');
          }
        } catch (e) {
          console.log('session check error', e);
        }
      } catch (err) {
        console.log('DB init error', err);
      }
    })();
  }, []);

  // Cargar el tipo de usuario cada vez que cambie el id actual
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (currentUserId) {
          const { getUserById } = await import('./utils/database');
          const user = await getUserById(currentUserId);
          if (mounted) setUserType(user?.userType || null);
        } else {
          if (mounted) setUserType(null);
        }
      } catch (e) {
        if (mounted) setUserType(null);
      }
    })();
    return () => { mounted = false; };
  }, [currentUserId]);

  // handle logout action triggered by navigation('Logout')
  useEffect(() => {
    if (currentScreen === 'logout') {
      (async () => {
        try {
          await AsyncStorage.removeItem('currentUserId');
        } catch (e) {
          console.warn('Error clearing session', e);
        }
        setCurrentUserId(null);
        setCurrentScreen('welcome');
      })();
    }
  }, [currentScreen]);

  if (currentScreen === 'login') {
    return (
      <LoginScreen
        navigation={{
          navigate: (name, params) => {
            const screenName = String(name).toLowerCase();
            if (params) {
              setScreenParams({ [screenName]: params });
            }
            setCurrentScreen(screenName);
          },
        }}
        onBack={() => setCurrentScreen('welcome')}
        onCreateAccount={() => setCurrentScreen('signup')}
        onLoginSuccess={id => {
          setCurrentUserId(id);
          setCurrentScreen('home');
        }}
      />
    );
  }

  // perfil alumno (vista que usan tutores al seleccionar un alumno)
  if (currentScreen === 'perfilalumno') {
    const params = screenParams['perfilalumno'] || {};
    return (
      <PerfilAlumnoScreen
        navigation={{
          goBack: () => {
            setScreenParams({});
            setCurrentScreen(params.previousScreen || 'tutores');
          },
          navigate: name => setCurrentScreen(String(name).toLowerCase()),
        }}
        route={{ params: { alumnoId: params.alumnoId } }}
      />
    );
  }

  if (currentScreen === 'signup') {
    return (
      <CuentaNuevaScreen
        navigation={{
          goBack: () => setCurrentScreen('login'),
        }}
        onBack={() => setCurrentScreen('login')}
      />
    );
  }
  if (currentScreen === 'welcome') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Bienvenido a Aula Cardinal</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setCurrentScreen('login')}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Ir a Login</Text>
        </TouchableOpacity>
        <StatusBar style="auto" />
      </View>
    );
  }

  // authenticated home screen (navegación simple por estado)
  if (currentScreen === 'home') {
    const commonNavigation = {
      navigate: (name, params) => {
        const screenName = String(name).toLowerCase();
        if (params) {
          setScreenParams({ [screenName]: params });
        } else {
          setScreenParams({ [screenName]: { usuarioId: currentUserId } });
        }
        setCurrentScreen(screenName);
      },
    };

    if (userType === 'Tutor') {
      return (
        <HomeTutorado
          navigation={commonNavigation}
          currentUserId={currentUserId}
        />
      );
    }

    // default: Tutorado u otros
    return (
      <HomeScreen
        navigation={commonNavigation}
        currentUserId={currentUserId}
      />
    );
  }

  // perfil screen
  if (currentScreen === 'perfil') {
    const PerfilComponent = userType === 'Tutor' ? PerfilScreenTutor : PerfilScreen;
    return (
      <PerfilComponent
        navigation={{
          goBack: () => setCurrentScreen('home'),
          navigate: name => setCurrentScreen(String(name).toLowerCase()),
        }}
        route={{ params: { usuarioId: currentUserId || 1 } }}
      />
    );
  }

  // editar perfil
  if (currentScreen === 'editarperfil') {
    return (
      <EditarPerfilScreen
        navigation={{
          goBack: () => setCurrentScreen('home'),
          navigate: name => setCurrentScreen(String(name).toLowerCase()),
        }}
        route={{ params: { usuarioId: currentUserId || 1 } }}
      />
    );
  }

  // agendar sesion
  if (currentScreen === 'agendarsesion') {
    const params = screenParams['agendarsesion'] || {};
    const previousScreen = params.previousScreen || 'home';
    // Allow callers to force the student (screens/) component by passing `forceStudent: true`
    const forceStudent = params.forceStudent === true;
    const AgendarSesionComponent = forceStudent ? AgendarSesionScreen : (userType === 'Tutor' ? AgendarSesionScreenTutor : AgendarSesionScreen);
    
    return (
      <AgendarSesionComponent
        navigation={{
          goBack: () => {
            setScreenParams({});
            setCurrentScreen(previousScreen);
            // Si veníamos de miagenda, forzar recarga
            if (previousScreen === 'miagenda') {
              setMiAgendaRefreshKey(prev => prev + 1);
            }
          },
          navigate: (name, navParams) => {
            const screenName = String(name).toLowerCase();
            if (navParams) {
              setScreenParams({ [screenName]: navParams });
            }
            setCurrentScreen(screenName);
          },
        }}
        route={{ params: { usuarioId: params.usuarioId || currentUserId || 1, sesionEdit: params.sesionEdit } }}
      />
    );
  }

  // mi agenda
  if (currentScreen === 'miagenda') {
    const params = screenParams['miagenda'] || {};
    const MiAgendaComponent = userType === 'Tutor' ? MiAgendaScreenTutor : MiAgendaScreen;
    
    return (
      <MiAgendaComponent
        key={miAgendaRefreshKey}
        navigation={{
          goBack: () => {
            setScreenParams({});
            setCurrentScreen('home');
          },
          navigate: (name, navParams) => {
            const screenName = String(name).toLowerCase();
            if (navParams) {
              setScreenParams({ [screenName]: navParams });
            }
            setCurrentScreen(screenName);
          },
        }}
        route={{ params: { usuarioId: params.usuarioId || currentUserId || 1 } }}
      />
    );
  }

    // editar una agenda (desde MiAgenda)
    if (currentScreen === 'agendaeditar') {
      const params = screenParams['agendaeditar'] || {};
      return (
        <AgendaEditar
          navigation={{
            goBack: () => {
              setScreenParams({});
              setCurrentScreen(params.previousScreen || 'miagenda');
            },
            navigate: (name, navParams) => {
              const screenName = String(name).toLowerCase();
              if (navParams) {
                setScreenParams({ [screenName]: navParams });
              }
              setCurrentScreen(screenName);
            },
          }}
          route={{ params: { sesionId: params.sesionId, previousScreen: params.previousScreen || 'miagenda' } }}
        />
      );
    }

  // calificaciones
  if (currentScreen === 'calificaciones') {
    const params = screenParams['calificaciones'] || {};
    
    return (
      <CalificacionesScreen
        navigation={{
          goBack: () => {
            setScreenParams({});
            setCurrentScreen('home');
          },
          navigate: (name, navParams) => {
            const screenName = String(name).toLowerCase();
            if (navParams) {
              setScreenParams({ [screenName]: navParams });
            }
            setCurrentScreen(screenName);
          },
          currentUserId,
        }}
        route={{ params }}
      />
    );
  }

  // notificaciones
  if (currentScreen === 'notificaciones') {
    const NotificacionesComponent = userType === 'Tutor' ? NotificacionesScreen : NotificacionesTutoradoScreen;
    return (
      <NotificacionesComponent
        navigation={{
          goBack: () => setCurrentScreen('home'),
          navigate: name => setCurrentScreen(String(name).toLowerCase()),
        }}
        route={{ params: { usuarioId: currentUserId || 1 } }}
        userType={userType}
      />
    );
  }

  // recuperar contraseña
  if (currentScreen === 'recuperarcontrasena') {
    const params = screenParams['recuperarcontrasena'] || {};
    
    return (
      <RecuperarContrasenaScreen
        navigation={{
          goBack: () => {
            setScreenParams({});
            setCurrentScreen('login');
          },
          navigate: name => setCurrentScreen(String(name).toLowerCase()),
        }}
        route={{ params }}
      />
    );
  }

  // tutores
  if (currentScreen === 'tutores') {
    const params = screenParams['tutores'] || {};
    const TutoresComponent = userType === 'Tutor' ? TutoresScreenTutor : TutoresScreen;
    return (
      <TutoresComponent
        navigation={{
          goBack: () => {
            setScreenParams({});
            setCurrentScreen('home');
          },
          navigate: (name, navParams) => {
            const screenName = String(name).toLowerCase();
            if (navParams) {
              setScreenParams({ [screenName]: navParams });
            }
            setCurrentScreen(screenName);
          },
        }}
        route={{ params: { usuarioId: params.usuarioId || currentUserId || 1 } }}
      />
    );
  }

  // solicitudes (para tutores)
  if (currentScreen === 'solicitudes') {
    const params = screenParams['solicitudes'] || {};

    return (
      <SolicitudesScreen
        navigation={{
          goBack: () => {
            setScreenParams({});
            setCurrentScreen('home');
          },
          navigate: (name, navParams) => {
            const screenName = String(name).toLowerCase();
            if (navParams) {
              setScreenParams({ [screenName]: navParams });
            }
            setCurrentScreen(screenName);
          },
          currentUserId,
        }}
        route={{ params }}
      />
    );
  }

  // alumnos (vista para tutores)
  if (currentScreen === 'alumnos') {
    const params = screenParams['alumnos'] || {};

    return (
      <AlumnosScreen
        navigation={{
          goBack: () => {
            setScreenParams({});
            setCurrentScreen('home');
          },
          navigate: (name, navParams) => {
            const screenName = String(name).toLowerCase();
            if (navParams) {
              setScreenParams({ [screenName]: navParams });
            }
            setCurrentScreen(screenName);
          },
          currentUserId,
        }}
        route={{ params }}
      />
    );
  }
  // calificar
  if (currentScreen === 'calificar') {
    const params = screenParams['calificar'] || {};
    const previousScreen = params.previousScreen || 'tutores';
    const CalificarComponent = userType === 'Tutor' ? CalificarScreenTutor : CalificarScreen;
    
    return (
      <CalificarComponent
        navigation={{
          goBack: () => {
            setScreenParams({});
            setCurrentScreen(previousScreen);
          },
          navigate: (name, navParams) => {
            const screenName = String(name).toLowerCase();
            if (navParams) {
              setScreenParams({ [screenName]: navParams });
            }
            setCurrentScreen(screenName);
          },
        }}
        route={{ 
          params: { 
            usuarioId: params.usuarioId || currentUserId || 1,
            personaId: params.personaId,
            esTutor: params.esTutor,
            materia: params.materia,
            tutorName: params.tutorName,
          } 
        }}
      />
    );
  }

  // perfil tutor
  if (currentScreen === 'perfiltutor') {
    const params = screenParams['perfiltutor'] || {};
    const PerfilTutorComponent = userType === 'Tutor' ? PerfilTutorScreenTutor : PerfilTutorScreen;
    
    return (
      <PerfilTutorComponent
        navigation={{
          goBack: () => {
            setScreenParams({});
            setCurrentScreen('home');
          },
          navigate: (name, navParams) => {
            const screenName = String(name).toLowerCase();
            if (navParams) {
              setScreenParams({ [screenName]: navParams });
            }
            setCurrentScreen(screenName);
          },
          currentUserId: currentUserId,
        }}
        route={{ 
          params: { 
            tutorId: params.tutorId,
            usuarioId: params.usuarioId || currentUserId || 1,
          } 
        }}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E6D3',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#8B4513',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
