# Implementación de Stack Navigation

## Cambios Realizados

### ✅ Estructura de Navegación
- **App.js**: Convertido a usar `@react-navigation/native` y `@react-navigation/stack`
- **CustomHeader**: Componente compartido con menú hamburguesa y navegación
- Todas las pantallas ahora comparten el mismo header personalizado

### 📁 Archivos Creados
- `components/CustomHeader.js` - Header reutilizable con menú lateral

### 🔄 Archivos Modificados
- `App.js` - Implementación completa de Stack Navigator
- `screens/HomeScreen.js` - Removido header local, ahora usa CustomHeader
- `screens/HomeTutorado.js` - Removido header local, ahora usa CustomHeader

### 🎯 Funcionalidades
1. **Header Compartido**: Todas las pantallas autenticadas tienen el mismo header con:
   - Logo y título
   - Menú hamburguesa animado
   - Navegación contextual según rol (Tutor/Tutorado)

2. **Navegación por Rol**:
   - **Tutorado**: Inicio, Mis agendas, Tutores, Perfil, Cerrar sesión
   - **Tutor**: Inicio, Mi agenda, Solicitudes, Perfil, Cerrar sesión

3. **Pantallas sin Header**:
   - Welcome
   - Login
   - Signup
   - RecuperarContrasena

4. **Pantallas con Header**:
   - Home / HomeTutor
   - Perfil
   - EditarPerfil
   - MiAgenda
   - AgendarSesion
   - Tutores
   - Calificar
   - Calificaciones
   - Notificaciones
   - Solicitudes

### 🚀 Cómo Funciona

**Autenticación y Routing**:
```javascript
// Al hacer login, se determina el rol del usuario
const user = await getUserById(id);
// Se navega al Home correspondiente
navigation.reset({
  index: 0,
  routes: [{ name: user?.userType === 'Tutor' ? 'HomeTutor' : 'Home' }],
});
```

**Header Dinámico**:
```javascript
// El header recibe el userType para mostrar menú correcto
<CustomHeader 
  navigation={navigation} 
  title="¡HOLA CARDENAL!" 
  userType="Tutorado"
/>
```

### 📝 Notas
- El menú se cierra automáticamente al navegar
- La sesión persiste con AsyncStorage
- El logout limpia la sesión y regresa a Welcome
- El estado `userType` se actualiza dinámicamente según el usuario logueado

### 🧪 Pruebas
**Tutorado**:
- Email: `124050107@upq.edu.mx`
- Password: `12345678`

**Tutor**:
- Email: `luis.barron@upq.edu.mx`
- Password: `12345678`
