import React, { useState, useEffect } from 'react';

const Configuracion = ({ onLogout }) => {
  const [userData, setUserData] = useState({ nombre: '', correo: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false); // Controla la visibilidad del formulario

  // Función para obtener datos del usuario
  const fetchUserData = async () => {
    try {
      const response = await fetch('http://localhost:3000/usuario/1'); // Cambia la URL según tu configuración
      if (!response.ok) {
        throw new Error('Error al obtener los datos del usuario');
      }
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Error:', error);
      alert('No se pudieron cargar los datos del usuario');
    }
  };

  // Llamar a la función cuando el componente se monte
  useEffect(() => {
    fetchUserData();
  }, []);

  // Función para manejar el cambio de contraseña
  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (newPassword !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: userData.correo, nuevaContraseña: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Contraseña cambiada exitosamente.');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrorMessage(data.message || 'Error al cambiar la contraseña.');
      }
    } catch (error) {
      setErrorMessage('Error al conectar con el servidor.');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Configuración</h1>
      <div style={styles.userInfo}>
        <p style={styles.text}><strong>Nombre:</strong> {userData.nombre}</p>
        <p style={styles.text}><strong>Correo:</strong> {userData.correo}</p>
      </div>

      <button
        onClick={() => setShowPasswordForm(!showPasswordForm)}
        style={{
          ...styles.button,
          marginBottom: '20px',
          backgroundColor: showPasswordForm ? '#ff4d4d' : '#1db954',
        }}
      >
        {showPasswordForm ? 'Cambiar Contraseña' : 'Cambiar Contraseña'}
      </button>

      {showPasswordForm && (
        <form onSubmit={handlePasswordChangeSubmit} style={styles.form}>
          <h2 style={styles.subtitle}>Cambiar Contraseña</h2>
          <div style={styles.inputGroup}>
            <label htmlFor="newPassword" style={styles.label}>
              Nueva Contraseña
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Introduce tu nueva contraseña"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label htmlFor="confirmPassword" style={styles.label}>
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirma tu nueva contraseña"
              style={styles.input}
              required
            />
          </div>
          {errorMessage && <p style={styles.error}>{errorMessage}</p>}
          {successMessage && <p style={styles.success}>{successMessage}</p>}
          <button type="submit" style={styles.button}>
            Cambiar Contraseña
          </button>
        </form>
      )}

      <button onClick={onLogout} style={{ ...styles.button, marginTop: '20px', backgroundColor: '#ff4d4d' }}>
        Cerrar sesión
      </button>
    </div>
  );
};

const styles = {
  container: {
    padding: '40px',
    backgroundColor: '#1e1e2e',
    color: '#ffffff',
    borderRadius: '15px',
    maxWidth: '600px',
    margin: 'auto',
    boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.3)',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '30px',
    textAlign: 'center',
    color: '#1db954',
  },
  subtitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center',
  },
  userInfo: {
    backgroundColor: '#2c2c3e',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '30px',
    lineHeight: '2',
  },
  text: {
    fontSize: '20px',
    margin: '10px 0',
  },
  form: {
    marginBottom: '30px',
  },
  inputGroup: {
    marginBottom: '15px',
    textAlign: 'left',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    marginBottom: '5px',
    color: '#d1d1d1',
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '18px',
  },
  button: {
    display: 'block',
    width: '100%',
    padding: '15px',
    backgroundColor: '#1db954',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '20px',
    fontWeight: 'bold',
    textAlign: 'center',
    boxShadow: '0px 5px 15px rgba(29, 185, 84, 0.5)',
    transition: 'all 0.3s ease-in-out',
  },
  error: {
    color: 'red',
    fontSize: '14px',
    marginTop: '10px',
  },
  success: {
    color: 'green',
    fontSize: '14px',
    marginTop: '10px',
  },
};

export default Configuracion;
