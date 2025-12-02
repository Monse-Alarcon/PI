import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/LoginScreen';
import CuentaNuevaScreen from './screens/CuentaNuevaScreen';
import HomeScreen from './screens/HomeScreen';
import PerfilScreen from './screens/PerfilScreen';
import EditarPerfilScreen from './screens/EditarPerfilScreen';
import { useEffect, useState } from 'react';
import { initDB, seedInitialUser, getUserByEmail, initSesionesTable, initMaestroMateriasTable, seedMaestrosAndMaterias } from './utils/database';
import AgendarSesionScreen from './screens/AgendarSesionScreen';
import MiAgendaScreen from './screens/MiAgendaScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome'); // 'welcome', 'login', 'signup', 'home'
  const [currentUserId, setCurrentUserId] = useState(null);
  const [screenParams, setScreenParams] = useState({});
  const [miAgendaRefreshKey, setMiAgendaRefreshKey] = useState(0);

  useEffect(() => {
    // initialize DB and seed a known user
    (async () => {
      try {
        await initDB();
        await initSesionesTable();
        await initMaestroMateriasTable();
        await seedInitialUser();
        await seedMaestrosAndMaterias();
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
        onBack={() => setCurrentScreen('welcome')}
        onCreateAccount={() => setCurrentScreen('signup')}
        onLoginSuccess={id => {
          setCurrentUserId(id);
          setCurrentScreen('home');
        }}
      />
    );
  }

  if (currentScreen === 'signup') {
    return (
      <CuentaNuevaScreen
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
    return (
      <HomeScreen
        navigation={{
          navigate: (name, params) => {
            const screenName = String(name).toLowerCase();
            if (params) {
              setScreenParams({ [screenName]: params });
            } else {
              setScreenParams({ [screenName]: { usuarioId: currentUserId } });
            }
            setCurrentScreen(screenName);
          },
        }}
        currentUserId={currentUserId}
      />
    );
  }

  // perfil screen
  if (currentScreen === 'perfil') {
    return (
      <PerfilScreen
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
    
    return (
      <AgendarSesionScreen
        navigation={{
          goBack: () => {
            setScreenParams({});
            setCurrentScreen(previousScreen);
            // Si veníamos de miagenda, forzar recarga
            if (previousScreen === 'miagenda') {
              setMiAgendaRefreshKey(prev => prev + 1);
            }
          },
          navigate: name => setCurrentScreen(String(name).toLowerCase()),
        }}
        route={{ params: { usuarioId: params.usuarioId || currentUserId || 1, sesionEdit: params.sesionEdit } }}
      />
    );
  }

  // mi agenda
  if (currentScreen === 'miagenda') {
    const params = screenParams['miagenda'] || {};
    
    return (
      <MiAgendaScreen
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
