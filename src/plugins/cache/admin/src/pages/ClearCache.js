import React, { useState, useEffect } from 'react';
import { Button } from '@strapi/design-system/Button';
import { Typography } from '@strapi/design-system/Typography';
import { Box } from '@strapi/design-system/Box';
import { useNotification } from '@strapi/helper-plugin';

const ClearCache = () => {
  const toggleNotification = useNotification();
  const [loading, setLoading] = useState(false);

  const handleClearCache = async () => {
    setLoading(true);
    try {
      const response = await fetch('/cache/clear', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to clear cache');
      const result = await response.json();
      if (result.success) {
        toggleNotification({ type: 'success', message: 'Cache cleared successfully!' });
      }
    } catch (error) {
      toggleNotification({ type: 'warning', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box padding={4}>
      <Typography variant="alpha">Cache Management</Typography>
      <Button
        onClick={handleClearCache}
        variant="danger"
        style={{ marginTop: '20px' }}
        disabled={loading}
      >
        {loading ? 'Clearing...' : 'Clear All Cache'}
      </Button>
    </Box>
  );
};

export default ClearCache;
