import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';

export default function CalificacionesScreen({ navigation, route }) {
  const { nombrePersona = 'Daniela López Pacheco' } = route?.params || {};

  const handleGoBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    }
  };
  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState('');

  const handleStarPress = (starNumber) => {
    setRating(starNumber);
  };

  const handleEnviarResena = () => {
    if (rating === 0) {
      Alert.alert('Calificación requerida', 'Por favor selecciona una calificación antes de enviar.');
      return;
    }

    Alert.alert(
      'Reseña enviada',
      `Calificación: ${rating} estrellas\nComentario: ${comentario || 'Sin comentario'}`,
      [{ text: 'OK', onPress: () => navigation?.goBack ? navigation.goBack() : null }]
    );
  };

  const renderStar = (starNumber) => {
    const isFilled = starNumber <= rating;
    return (
      <TouchableOpacity
        key={starNumber}
        onPress={() => handleStarPress(starNumber)}
        activeOpacity={0.7}
      >
        <Text style={styles.star}>{isFilled ? '⭐' : '☆'}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Logo en la esquina superior */}
      <TouchableOpacity 
        style={styles.logoContainer}
        onPress={handleGoBack}
        activeOpacity={0.7}
      >
        <Image
          source={require('../assets/LogoMenu.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Tarjeta de calificación */}
      <View style={styles.card}>
        <Text style={styles.title}>Califica a tu tutor o{'\n'}alumno</Text>
        
        <Text style={styles.subtitle}>
          Selecciona las estrellitas que consideras que califican{'\n'}a este profesor
        </Text>

        <Text style={styles.nombrePersona}>{nombrePersona}</Text>

        {/* Estrellas */}
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map(renderStar)}
        </View>

        {/* Campo de comentario */}
        <Text style={styles.comentarioLabel}>Comentario:</Text>
        <TextInput
          style={styles.comentarioInput}
          placeholder="Escribe tu opinión aquí..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          value={comentario}
          onChangeText={setComentario}
          textAlignVertical="top"
        />

        {/* Botón enviar */}
        <TouchableOpacity
          style={styles.enviarButton}
          onPress={handleEnviarResena}
          activeOpacity={0.8}
        >
          <Text style={styles.enviarButtonText}>Enviar reseña</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D4A574',
    paddingTop: 20,
  },
  logoContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
  },
  logo: {
    width: 60,
    height: 60,
  },
  card: {
    backgroundColor: '#F5E6D3',
    marginHorizontal: 20,
    marginTop: 80,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5D3A1A',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 12,
    color: '#5D3A1A',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  nombrePersona: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D3A1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 25,
  },
  star: {
    fontSize: 50,
  },
  comentarioLabel: {
    fontSize: 14,
    color: '#5D3A1A',
    alignSelf: 'flex-start',
    marginBottom: 8,
    fontWeight: '600',
  },
  comentarioInput: {
    backgroundColor: '#B88E6F',
    borderRadius: 10,
    padding: 15,
    width: '100%',
    minHeight: 100,
    color: '#FFF',
    fontSize: 14,
    marginBottom: 20,
  },
  enviarButton: {
    backgroundColor: '#5D3A1A',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  enviarButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
