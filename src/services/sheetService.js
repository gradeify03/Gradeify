const API_BASE_URL = 'http://localhost:3001/api';

export const createNewSheet = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/create-sheet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create new sheet');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating new sheet:', error);
    throw error;
  }
};

export const checkServerHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Server health check failed:', error);
    return false;
  }
}; 