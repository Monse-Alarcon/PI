import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import CustomHeader from '../components/CustomHeader';
import { getUserByEmail, updateUserPassword } from '../utils/database';

export default function RecuperarContrasenaScreen({ navigation, route }) {
  const emailParam = route?.params?.email || '';
  
  const [step, setStep] = useState(1); // 1: email, 2: código, 3: nueva contraseña
  const [email, setEmail] = useState(emailParam);
  const [codigo, setCodigo] = useState('');
  const [codigoEnviado, setCodigoEnviado] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Configura tus credenciales de EmailJS aquí
  const EMAILJS_SERVICE_ID = 'service_ip4unfs';
  const EMAILJS_TEMPLATE_ID = 'template_2g4thv8';
  const EMAILJS_PUBLIC_KEY = 'pg8GDKZp7aHCFwJV3';
  const EMAILJS_PRIVATE_KEY = 'c_EghJH86JN66Brtru9hT';

  const generarCodigo = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const enviarCodigoEmail = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un correo válido');
      return;
    }

    setLoading(true);

    try {
      // Verificar si el usuario existe
      const user = await getUserByEmail(email);
      if (!user) {
        setLoading(false);
        Alert.alert('Error', 'No existe una cuenta con este correo electrónico');
        return;
      }

      // Generar código de verificación
      const codigoVerificacion = generarCodigo();
      setCodigoEnviado(codigoVerificacion);

      // Parámetros para el template de EmailJS
      const templateParams = {
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        accessToken: EMAILJS_PRIVATE_KEY,
        template_params: {
          to_email: email,
          to_name: user.name,
          verification_code: codigoVerificacion,
          app_name: 'Aula Cardinal',
        }
      };

      // Enviar email usando la API REST de EmailJS
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateParams),
      });

      const responseData = await response.text();
      console.log('EmailJS Response:', response.status, responseData);

      if (!response.ok) {
        throw new Error(`EmailJS Error: ${response.status} - ${responseData}`);
      }

      setLoading(false);
      Alert.alert(
        'Código Enviado',
        'Se ha enviado un código de verificación a tu correo electrónico',
        [{ text: 'OK', onPress: () => setStep(2) }]
      );
    } catch (error) {
      setLoading(false);
      console.error('Error al enviar email:', error);
      Alert.alert('Error', 'No se pudo enviar el código. Por favor intenta de nuevo.');
    }
  };

  const verificarCodigo = () => {
    if (!codigo) {
      Alert.alert('Error', 'Por favor ingresa el código de verificación');
      return;
    }

    if (codigo !== codigoEnviado) {
      Alert.alert('Error', 'El código ingresado es incorrecto');
      return;
    }

    Alert.alert(
      'Código Verificado',
      'Ahora puedes establecer tu nueva contraseña',
      [{ text: 'OK', onPress: () => setStep(3) }]
    );
  };

  const cambiarContrasena = async () => {
    if (!nuevaContrasena || !confirmarContrasena) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (nuevaContrasena.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await updateUserPassword(email, nuevaContrasena);
      setLoading(false);
      
      Alert.alert(
        'Contraseña Actualizada',
        'Tu contraseña ha sido cambiada exitosamente',
        [
          {
            text: 'OK',
            onPress: () => {
              if (navigation?.goBack) {
                navigation.goBack();
              }
            },
          },
        ]
      );
    } catch (error) {
      setLoading(false);
      console.error('Error al actualizar contraseña:', error);
      Alert.alert('Error', 'No se pudo actualizar la contraseña. Intenta de nuevo.');
    }
  };

  const handleGoBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const renderStep1 = () => (
    <>
      <Text style={styles.title}>Recuperar Contraseña</Text>
      <Text style={styles.subtitle}>
        Ingresa tu correo electrónico y te enviaremos un código de verificación
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={enviarCodigoEmail}
        activeOpacity={0.7}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Enviar Código</Text>
        )}
      </TouchableOpacity>
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.title}>Verificar Código</Text>
      <Text style={styles.subtitle}>
        Ingresa el código de 6 dígitos que enviamos a {email}
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Código de verificación"
          placeholderTextColor="#999"
          value={codigo}
          onChangeText={setCodigo}
          keyboardType="number-pad"
          maxLength={6}
        />
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={verificarCodigo}
        activeOpacity={0.7}
      >
        <Text style={styles.primaryButtonText}>Verificar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={enviarCodigoEmail}
        activeOpacity={0.7}
      >
        <Text style={styles.linkText}>Reenviar código</Text>
      </TouchableOpacity>
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.title}>Nueva Contraseña</Text>
      <Text style={styles.subtitle}>
        Establece tu nueva contraseña
      </Text>

      <View style={styles.inputContainer}>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Nueva contraseña"
            placeholderTextColor="#999"
            value={nuevaContrasena}
            onChangeText={setNuevaContrasena}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirmar contraseña"
          placeholderTextColor="#999"
          value={confirmarContrasena}
          onChangeText={setConfirmarContrasena}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={cambiarContrasena}
        activeOpacity={0.7}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Cambiar Contraseña</Text>
        )}
      </TouchableOpacity>
    </>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <CustomHeader navigation={navigation} title="Recuperar Contraseña" showBackButton={true} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E6D3',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 30,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 14,
    color: '#5D3A1A',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#8B3A3A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B3A3A',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 8,
  },
  eyeText: {
    fontSize: 18,
  },
  primaryButton: {
    backgroundColor: '#8B4513',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  linkText: {
    color: '#A0826D',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  backButton: {
    backgroundColor: '#A0826D',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
